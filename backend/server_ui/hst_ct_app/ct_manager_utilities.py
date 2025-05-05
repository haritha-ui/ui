import os
import json
import time
import glob
import signal
import hashlib
import logging
import datetime
import threading
import subprocess

import yaml
import psutil
from django.db.models import Q

import stg_pyvault
from hst_ct_app.models import Tests
from hst_ct_app.models import Utilities
import sys
sys.path.append('/Auto/latest/robot/libraries/')
import power_releases as p
#from . import power_releases as p
from hst_ct_app import settings_ct_app as settings

logger = logging.getLogger(__name__)

class CTManager:
    PROCESS_IS_ALIVE = (settings.CT_TEST_STATUS['RUNNING'][0],
                        settings.CT_TEST_STATUS['TERMINATING'][0])
    def __init__(self, ct_base_dir=settings.CT_DIR_PATH, ct_logs_dir=settings.CT_UTILITIES_LOG_PATH):
        self.ct_base_dir = ct_base_dir
        self.ct_logs_dir = ct_logs_dir
        self.robot_path = os.path.join(ct_base_dir, 'robot')
        self.scripts_path = os.path.join(ct_base_dir, 'scripts')
        self.support_path = os.path.join(self.robot_path, 'support')
        self.runct_script = os.path.join(self.robot_path, 'runct.py')
        self.CT_YAML_FILES = {}
        self.running_procs = {}
        self.exit_proc_monitor = False
        self.proc_monitor_running = False
        self.rc_file_name = "rc.log"
        self.live_log_file_name = 'live.log'
        self.rqm_url = "https://jazzasa.rchland.ibm.com"
        self.rqm_script = os.path.join(self.support_path, "rqm_operations")
        self.rqm_pwd = None
        self.init_proc_monitor_thread_utility()

    def power_releases_helper(self,firm_type,hmc_name,server_name):
        # arg_len = len(sys.argv)
        # if arg_len >= 2:
        #     hmc_name = sys.argv[1]
        #     if arg_len >= 3:
        #         server_name = sys.argv[2]
        pobj = p.power_releases()
        build_type = "CCI" if firm_type != "dis" else "GA"
        try:
            status_value, builds = pobj.get_fw_builds(hmc_name=hmc_name, server_name=server_name, build_type=build_type)
            print('Data returned from get_fw_builds:', builds)

            if status_value == 0:
                return builds
            else:
                if not builds:  # Empty list is returned
                    return ["No builds available"]
                return {"error": builds[0]}  #Exception name is the first item in the list
            
        except Exception as exc:
            print(f'Unhandled Exception: {type(exc).__name__}: {exc}', file=sys.stderr)
            return {"error": f"{type(exc).__name__}: {str(exc)}"}  # Returning exception details

    #updated for utilities
    def _get_ct_command_its_hash_and_log_dir_utility(self, yaml_inputs,utility_type, user_):
        cur_date = datetime.datetime.now().strftime("%Y%m%d_%H%M%S%f")
        #log_dir = os.path.join(self.ct_logs_dir, f'test_{cur_date}')
        utilities_log_dir = os.path.join(self.ct_logs_dir, f'utilities_{cur_date}')
        if not os.path.exists(utilities_log_dir):
            os.makedirs(utilities_log_dir)

        #id_ = yaml_file.split(".")[0]
        robot_file = f"{utility_type}.robot"
        #run_mode = "prod" if yaml_inputs.get("TER_ID",None) else 'dev'
        rc_file = os.path.join(utilities_log_dir, self.rc_file_name)
        yaml_input_file = os.path.join(utilities_log_dir, 'input_file.yaml')
        live_log_file = os.path.join(utilities_log_dir, self.live_log_file_name)
        final_yaml_inputs = yaml_inputs
        with open(yaml_input_file, 'w') as fobj:
            yaml.dump(final_yaml_inputs, fobj, indent=4)
        hash_ = hashlib.sha1(str(cur_date).encode('utf-8')).hexdigest()
        input_variable =""
        for key, value in yaml_inputs.items():
            input_variable += f"-v {key}:{value} "
        # Remove the trailing space
        input_variable = input_variable.strip()
        #robot/Utilities/Disruptive_Firmware_Update.robot
        #Start nohup process with runct
        #cmd =   f"nohup python3 -u {self.runct_script} --hash {hash_} " + \
        #        f"-y {utilities_log_dir} --single {robot_file} input_file.yaml " + \
        #        f"-d {utilities_log_dir} -m dev --user {user_} > {live_log_file} " + \
        #        f"2>&1 && echo $? > {rc_file} 2>&1 &"
        
        #cmd = f"nohup robot -v run_mode:dev -V input_file.yaml -d {utilities_log_dir} {self.robot_path}/Utilities/{robot_file} > {live_log_file} 2>&1  && echo $? > {rc_file} 2>&1 &"
        #cmd = f"nohup robot -v run_mode:dev -v SYSTEM_NAME:ever97bmc -v HMC_NAME:hstp8hmc01.aus.stglabs.ibm.com -v FULL_FSP_HOSTNAME:ever97bmc.aus.stglabs.ibm.com -v FW_LEVEL:1060.2424.20240612a" + \
        #       f"-d {utilities_log_dir} {self.robot_path}/Utilities/CCI_Firmware_Update.robot > {live_log_file} 2>&1  && echo $? > {rc_file} 2>&1 &"
        cmd = f"nohup robot -v run_mode:dev {input_variable}" + \
                f" -d {utilities_log_dir} {self.robot_path}/Utilities/{utility_type}.robot > {live_log_file} 2>&1  && echo $? > {rc_file} 2>&1 &"
        return cmd, hash_, utilities_log_dir

    def reap_parent_proc_status(self, pobj):
        def thread_def(pobj):
            pobj.wait()
            #logger.debug(f"Finished proc:{pobj.pid}")
            logger.info(f"Finished proc:{pobj.pid}")
        logger.debug(f"Waiting for proc:{pobj.pid}")
        tobj = threading.Thread(target=thread_def, args=(pobj,), daemon=True)
        tobj.start()
        logger.info("reap parent done")

    def find_child_proc_id(self, command):
        """
        Returns the actual process id that is started as a child due to '&'
        usage for background process
        """
        cnt = 5
        while cnt > 0:
            #cmd = "ps -eo pid,cmd --sort pid |" +\
            #    f"grep -v grep| grep -w {hash_} | head -1 |" +\
            #    "awk {'print $1'}"
            # cmd = "ps -eo pid,command |" +\
            #     f"grep -v grep| grep -w {hash_} | head -1 |" +\
            #     "awk {'print $1'}"
            cmd = f"ps -eo pid,command | grep -v grep | grep -w '{command}' | head -1 | awk '{{print $1}}'"
            pobj = psutil.Popen(cmd, stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE, shell=True)
            out, err = pobj.communicate()
            if not err and out.strip():
                pid = int(out.strip())
                break
            else:
                logger.warning(f"Unable to find process id. {err}. Retrying")
                pid = 0
                time.sleep(0.5)
            cnt -= 1
        else:
            #logger.error(f'Error: Unable to find pid for {hash_}')
            logger.error(f'Error: Unable to find pid for this command')
            pid = 0
        return pid

    def add_process_for_monitor_utility(self, proc_id, hash_, jobid):
        if not hash_ in self.running_procs:
            self.running_procs[hash_] = {'pid': proc_id, 'jobid': jobid}
            if not self.proc_monitor_running:
                self.init_proc_monitor_thread_utility()
        else:
            logger.info(f'Job hash {hash_} already being monitored')

    #starting utility test process
    def start_ct_test_utility(self, actual_post_inputs, user_):
        print('start test checkpoint 1')
       # yaml_file = actual_post_inputs['yaml_file']
        yaml_inputs = actual_post_inputs['yaml_inputs']
        utility_type = actual_post_inputs['utility_category']
        print(utility_type)
        cust_yaml_inputs = {}
        cmd, hash_, log_dir = self._get_ct_command_its_hash_and_log_dir_utility(
             yaml_inputs,utility_type, user_)
        logger.info(f'Starting new task for {utility_type} from user {user_} with Cmd:\n{cmd}')
        os.chdir(self.ct_base_dir)
        pobj = subprocess.Popen(cmd, shell=True, start_new_session=True)
        self.reap_parent_proc_status(pobj)
        #pid = self.find_child_proc_id(hash_)
        pid = self.find_child_proc_id(cmd)
        rc_file = os.path.join(log_dir, self.rc_file_name)
        rc = None
        if os.path.exists(rc_file):
            with open(rc_file) as fobj:
                data = fobj.read()
                rc = data.strip.splitlines[0] if data.strip.splitlines(
                ) else None
        print (pid)
        return {
            'pid': pid,
            'hash': hash_,
            'rc': rc,
            'log_dir': log_dir
        }
    
    def update_finished_processes_utility(self, finished_procs):
        try:
            job_ids = (self.running_procs[hash_]['jobid']
                    for hash_ in finished_procs)
            rows = list(Utilities.objects.filter(id__in=job_ids))
            for row in rows:
                # If the current status is terminating we set it to 'terminated' 
                # when process exits
                if row.test_status == settings.CT_TEST_STATUS['TERMINATING'][0]:
                    row.test_status = settings.CT_TEST_STATUS['TERMINATED'][0]
                else:
                    # We try checking the rc.log file and decide the status.
                    # Absence of the file or non-zero value will be fail
                    #row.test_status = settings.CT_TEST_STATUS['PASS'][0]
                    try:
                        with open(os.path.join(row.log_location, self.rc_file_name)) as fobj:
                            proc_rc = fobj.read().strip().splitlines()[0]
                    except Exception as what:
                        logger.warning(
                            f'Unable to get rc for {row.id}: {what}. May be it failed')
                        proc_rc = '50000'  # Just some random value
                    logger.info(f"RC for {row.id} is {proc_rc}")
                    if proc_rc == '0':
                        row.test_status = settings.CT_TEST_STATUS['PASS'][0]
                    else:
                        row.test_status = settings.CT_TEST_STATUS['FAIL'][0]
                row.save()
                #self.init_tcr_update_thread(row.id, row.log_location)
                self.running_procs.pop(row.proc_hash)
        except Exception as what:
            logger.error(f'Updating finished processes info to db failed {what}')

    @staticmethod
    def get_live_procs():
        return Utilities.objects.filter(
            Q(test_status=settings.CT_TEST_STATUS["RUNNING"][0]) |
            Q(test_status=settings.CT_TEST_STATUS["TERMINATING"][0])
        )

    def monitor_all_running_processes_utility(self):
        try:
            # Get all live process when first starting the process of monitoring
            logger.debug('Starting process monitor')
            self.proc_monitor_running = True
            if not self.running_procs:
                live_procs = self.get_live_procs()
                for proc in live_procs:
                    self.running_procs[proc.proc_hash] = {
                        'pid': proc.proc_id, 'jobid': proc.id}

            # Start monitoring live processes that are available
            while not self.exit_proc_monitor:
                if not self.get_live_procs():
                    logger.debug("No live process available to monitor. Exiting!!")
                    break
                proc_objs = []
                finished_procs = []
                for hash_, proc_obj in self.running_procs.items():
                    try:
                        p = psutil.Process(proc_obj['pid'])
                        proc_objs.append(p)
                    except Exception:
                        logger.debug(f"Process not available for monitoring {proc_obj['pid']}")
                        finished_procs.append(hash_)
                # Wait for finish
                st_time = time.time()
                gone, _ = psutil.wait_procs(
                    proc_objs, timeout=settings.CT_PROC_MONITOR_TIMEOUT)

                for proc in gone:
                    for hash_, jobid in self.running_procs.items():
                        if proc.pid == jobid:
                            finished_procs.append(hash_)
                            break
                    else:
                        logger.error(
                            f'Error: Unable to find proc {proc.pid} in running proc list')
                self.update_finished_processes_utility(finished_procs)
                # Sleep for maximum specified timeout if the wait for processes 
                # ends earlier
                end_time = time.time()
                if (end_time - st_time) < settings.CT_PROC_MONITOR_TIMEOUT:
                    time.sleep(settings.CT_PROC_MONITOR_TIMEOUT -
                            (end_time - st_time))

            self.proc_monitor_running = False
            logger.debug('Process monitor ended')
        except Exception as what:
            print(what)
            logger.error(f"Failed to mointor running processes. {what}")


    def init_proc_monitor_thread_utility(self, check_live_procs=True):
        try:
            live_procs = self.get_live_procs()
            if check_live_procs and not live_procs:
                logger.info('No procs available to monitor')
                return
        except Exception as what:
            logger.error(f'Live process monitor failed to start. {what}')
            return
        if self.proc_monitor_running:
            logger.debug('Monitor thread is already running. Not started again')
            return
        tobj = threading.Thread(target=self.monitor_all_running_processes_utility)
        tobj.setDaemon(True)
        tobj.start()
        print('started monitor thread')

    def get_live_log_data_utilities(self, jobid):
        job = Utilities.objects.get(id=jobid)
        log_file = os.path.join(job.log_location, self.live_log_file_name)
        # data = ''
        # with open(log_file) as fobj:
        #     tmp = fobj.read()
        #     data = tmp
        #     while tmp:
        #         tmp = fobj.read()
        #         data += tmp
        data = ""
        with open(log_file) as fobj:
            for line in fobj:
                data += line

        return {
            'data': data,
            'jobid': jobid,
            'status': job.test_status,
            'time_start': job.start_time,
            'time_end': '' if job.test_status in self.PROCESS_IS_ALIVE else job.end_time,
           # 'ter_id': job.ter_id,
            #'tcr_id': job.tcr_id,
           #'tp_id': job.tp_id,
           # 'run_type': job.run_type,
            'sp_name': job.sp_name,
           # 'test_function': job.test_function,
            'utility_category': job.utility
        }

    def __del__(self):
        logger.info('Exiting CT manager object')
        self.exit_proc_monitor = True