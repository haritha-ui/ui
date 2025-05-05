
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
from hst_ct_app import settings_ct_app as settings

logger = logging.getLogger(__name__)

class CTManager:
    PROCESS_IS_ALIVE = (settings.CT_TEST_STATUS['RUNNING'][0],
                        settings.CT_TEST_STATUS['TERMINATING'][0])

    def __init__(self, ct_base_dir=settings.CT_DIR_PATH, ct_logs_dir=settings.CT_TEST_LOG_PATH):
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
        self.init_proc_monitor_thread()

    def list_ct_test_dir(self, type, value, refresh=False):
        """
        List all available robot Test case directories and the robot files
        """
        # Currently we dont have search logic based on TERs
        if type == "terid":
            return self._get_ter_to_local_tc_mapping(value)
        else:
            return self._list_local_testcase_dir(value, refresh=refresh)

    def __get_rqm_password(self):
        return stg_pyvault.get_hst_hstctest_w3id()

    def __get_lab_password_from_ssh_script(self):
        lab_pwd_script = os.path.join(self.support_path, 'get_lab_password.sh')
        out = subprocess.check_output(
            lab_pwd_script, shell=True, timeout=10).strip().splitlines()[0]
        if isinstance(out, bytes):
            out = out.decode()
        return out

    def _get_tp_data_from_ter(self, ter_id):
        try:
            ter_id = ter_id.strip()
            if not self.rqm_pwd:
                self.rqm_pwd = self.__get_rqm_password()
            # Fetch RQM TER data
            count = 0
            tc_id = ""
            while count < 2:
                rqm_cmd = f"python3 {self.rqm_script} -s {self.rqm_url} -p {self.rqm_pwd} -id {ter_id} -f getter"
                count += 1
                pobj = subprocess.Popen(
                    rqm_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True, )
                try:
                    pobj.wait(timeout=10)
                except Exception as what:
                    logger.error(
                        f"Failed to get RQM data for {ter_id}. {what}. Retry {count+1}")
                    continue
                out, _ = pobj.communicate()
                if isinstance(out, bytes):
                    out = out.decode()
                if pobj.returncode != 0:
                    if 'login failed' in out.lower():
                        logger.warning('Login to RQM failed with existing lab password. Fetching latest lab password')
                        self.rqm_pwd = self.__get_rqm_password()
                    continue

                tc_id = out
                break

            return tc_id
        except Exception as what:
            logger.error(f'Failed to get TP data for TER {ter_id}. {what}')
            raise Exception(what)

    def _get_ter_to_local_tc_mapping(self, value):
        """
        Query RQM and fetch TCID w.r.t user provided TER id.
        Then return the needed yaml info based on the TC ID from repo
        """
        #cmd = f"./{self.rqm_script} "
        #pobj = subprocess.Popen()
        data = []
        tc_id = self._get_tp_data_from_ter(value)
        if not tc_id:
            return data
        else:
            tc_id = tc_id.strip().splitlines()[1].split(",")[2]
            if "TC" not in tc_id:
                tc_id = f"TC{tc_id}"
        return self._list_local_testcase_dir(tc_id, exact=True)

    def _list_local_testcase_dir(self, value, exact=False, refresh=False):
        """
        Returns a list of dicts with the dir name and files as values.
        If a value is provided only the tests containing the specific
        value if returned.
        """
        data = []
        # If there is a search value; strip of .yaml extension if available
        if value and value.endswith('.yaml'):
            value = value.strip('.yaml')
        if value:
            pass
        elif not refresh and self.CT_YAML_FILES:
            return self.CT_YAML_FILES

        # Get all the list of interested directories and yaml files available
        for folder, _, files in os.walk(self.robot_path):
            dir_lst = folder.split(os.path.sep)
            if dir_lst[-1] not in settings.CT_ROBOT_FOLDERS:
                continue
            tmp = {}
            tmp['dir'] = dir_lst[-1]
            if not value:
                tmp['files'] = [
                    file_ for file_ in files if file_.endswith('.yaml')]
            else:
                if exact:  # If exact match is needed
                    tmp['files'] = [
                        file_ for file_ in files if file_.endswith('.yaml') and value == file_.split('.yaml')[0]
                    ]
                else:
                    tmp['files'] = [
                        file_ for file_ in files if file_.endswith('.yaml') and value in file_
                    ]
            tmp['files'].sort()
            data.append(tmp)

        if not value:
            self.CT_YAML_FILES = sorted(data, key=lambda x: x['dir'])
            return self.CT_YAML_FILES
        else:
            return sorted(data, key=lambda x:x['dir'])

    def fetch_ct_yaml_content(self, test_dir, yaml_file):
        """
        Read selected YAML file and return its content as JSON object
        """
        try:
            file_path = os.path.join(
                self.robot_path, test_dir, yaml_file)
            if not os.path.exists(file_path):
                return {}

            with open(file_path) as fobj:
                data = yaml.safe_load(fobj)
            return data
        except Exception as what:
            logger.error(f"Failed to fetch yaml content for {test_dir}/{yaml_file}. {what}")
            raise Exception(what)

    def _get_ct_command_its_hash_and_log_dir(self, yaml_file, yaml_inputs, cust_yaml_inputs, user_):
        """
        Form a CT command that needs to be triggered from shell as bg process
        Return a tuple of formed command and an unique hash
        """
        # Time stamp for logs
        cur_date = datetime.datetime.now().strftime("%Y%m%d_%H%M%S%f")
        log_dir = os.path.join(self.ct_logs_dir, f'test_{cur_date}')
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        id_ = yaml_file.split(".")[0]
        robot_file = f"{id_}.robot"
        run_mode = "prod" if yaml_inputs.get("TER_ID",None) else 'dev'
        rc_file = os.path.join(log_dir, self.rc_file_name)
        yaml_input_file = os.path.join(log_dir, 'input_file.yaml')
        live_log_file = os.path.join(log_dir, self.live_log_file_name)
        # Merge only those custom yaml inputs to test yaml template inputs if they don't
        # already exist
        final_yaml_inputs = {
            k: v for k, v in cust_yaml_inputs.items() if k not in yaml_inputs}
        final_yaml_inputs.update(yaml_inputs)
        # Write user provided data (template yaml + custom yaml inputs) to a yaml file
        # in log dir
        with open(yaml_input_file, 'w') as fobj:
            yaml.dump(final_yaml_inputs, fobj, indent=4)
        hash_ = hashlib.sha1(str(cur_date).encode('utf-8')).hexdigest()
        cmd = f"nohup python3 -u {self.runct_script} --hash {hash_} " + \
              f"-y {log_dir} --single {robot_file} input_file.yaml " + \
              f"-d {log_dir} -m {run_mode} --id {id_} --user {user_} > {live_log_file} " + \
              f"2>&1 && echo $? > {rc_file} 2>&1 &"
        return cmd, hash_, log_dir

    def reap_parent_proc_status(self, pobj):
        def thread_def(pobj):
            pobj.wait()
            logger.debug(f"Finished proc:{pobj.pid}")
        logger.debug(f"Waiting for proc:{pobj.pid}")
        tobj = threading.Thread(target=thread_def, args=(pobj,), daemon=True)
        tobj.start()

    def find_child_proc_id(self, hash_):
        """
        Returns the actual process id that is started as a child due to '&'
        usage for background process
        """
        cnt = 5
        while cnt > 0:
            cmd = "ps -eo pid,cmd --sort pid |" +\
                f"grep -v grep| grep -w {hash_} | head -1 |" +\
                "awk {'print $1'}"
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
            logger.error(f'Error: Unable to find pid for {hash_}')
            pid = 0
        return pid

    def add_process_for_monitor(self, proc_id, hash_, jobid):
        if not hash_ in self.running_procs:
            self.running_procs[hash_] = {'pid': proc_id, 'jobid': jobid}
            if not self.proc_monitor_running:
                self.init_proc_monitor_thread()
        else:
            logger.info(f'Job hash {hash_} already being monitored')

    def start_ct_test(self, actual_post_inputs, user_):
        """
        Submit a CT Test for execution with provided inputs and return the proc ID
        """
        yaml_file = actual_post_inputs['yaml_file']
        yaml_inputs = actual_post_inputs['yaml_inputs']
        cust_yaml_inputs = actual_post_inputs['cust_yaml_inputs']
        cmd, hash_, log_dir = self._get_ct_command_its_hash_and_log_dir(
            yaml_file, yaml_inputs, cust_yaml_inputs, user_)

        logger.info(f'Starting new task for {yaml_file} from user {user_} with Cmd:\n{cmd}')
        os.chdir(self.ct_base_dir)
        pobj = subprocess.Popen(cmd, shell=True, start_new_session=True)
        self.reap_parent_proc_status(pobj)
        pid = self.find_child_proc_id(hash_)
        rc_file = os.path.join(log_dir, self.rc_file_name)
        rc = None
        if os.path.exists(rc_file):
            with open(rc_file) as fobj:
                data = fobj.read()
                rc = data.strip.splitlines[0] if data.strip.splitlines(
                ) else None
        if yaml_inputs.get('TER_ID', ''):
            pass  # Start a thread to fetch RQM data and update DB in BG
        return {
            'pid': pid,
            'hash': hash_,
            'rc': rc,
            'log_dir': log_dir
        }

    def monitor_running_process(self, pid, hash_=None):
        try:
            pobj = psutil.Process(int(pid))
            if hash_ and hash_ not in pobj.cmdline():
                running = False
            running = True
        except Exception as what:
            logger.error(f"Proces with pid:{pid} and hash:{hash_} not found. {what}")
            running = False
        return running

    def update_finished_processes(self, finished_procs):
        try:
            job_ids = (self.running_procs[hash_]['jobid']
                    for hash_ in finished_procs)
            rows = list(Tests.objects.filter(id__in=job_ids))
            for row in rows:
                # If the current status is terminating we set it to 'terminated' 
                # when process exits
                if row.test_status == settings.CT_TEST_STATUS['TERMINATING'][0]:
                    row.test_status = settings.CT_TEST_STATUS['TERMINATED'][0]
                else:
                    # We try checking the rc.log file and decide the status.
                    # Absence of the file or non-zero value will be fail
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
                self.init_tcr_update_thread(row.id, row.log_location)
                self.running_procs.pop(row.proc_hash)
        except Exception as what:
            logger.error(f'Updating finished processes info to db failed {what}')

    @staticmethod
    def get_live_procs():
        return Tests.objects.filter(
            Q(test_status=settings.CT_TEST_STATUS["RUNNING"][0]) |
            Q(test_status=settings.CT_TEST_STATUS["TERMINATING"][0])
        )

    def monitor_all_running_processes(self):
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
                self.update_finished_processes(finished_procs)
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

    def init_proc_monitor_thread(self, check_live_procs=True):
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
        tobj = threading.Thread(target=self.monitor_all_running_processes)
        tobj.setDaemon(True)
        tobj.start()


    def init_tcr_update_thread(self, job_id, log_dir_location):
        try:
            def __update_ter_data(job_id, ct_run_log_file_path):
                with open(ct_run_log_file_path, 'r') as fobj:
                    data = json.load(fobj)
                    tcr_id = data[-1].get("TCR_ID")
                    row = Tests.objects.get(id=job_id)
                    row.tcr_id = tcr_id
                    row.save(update_fields=['tcr_id'])
            files_list = glob.glob(os.path.join(log_dir_location,'**','ct_run_update*'))
            if not files_list:
                ct_run_file = ""
                logger.error(f"Cant find CT run update file for job {job_id} to update TCR")
                return
            else:
                logger.info(f'Updating TCR ID for {job_id} from {files_list[0]}')
                ct_run_file = files_list[0]

            tobj = threading.Thread(target=__update_ter_data, args=(job_id, ct_run_file))
            tobj.setDaemon(True)
            tobj.start()
        except Exception as what:
            logger.error(f"Failed to update TCR id to DB. {what}")

    def get_live_log_data(self, jobid):
        job = Tests.objects.get(id=jobid)
        log_file = os.path.join(job.log_location, self.live_log_file_name)
        data = ''
        with open(log_file) as fobj:
            tmp = fobj.read()
            data = tmp
            while tmp:
                tmp = fobj.read()
                data += tmp
        return {
            'data': data,
            'jobid': jobid,
            'status': job.test_status,
            'time_start': job.start_time,
            'time_end': '' if job.test_status in self.PROCESS_IS_ALIVE else job.end_time,
            'ter_id': job.ter_id,
            'tcr_id': job.tcr_id,
            'tp_id': job.tp_id,
            'run_type': job.run_type,
            'sp_name': job.sp_name,
            'test_function': job.test_function,
            'test_category': job.test_category
        }

    def compress_log_data(self, jobid):
        log_path = Tests.objects.get(id=jobid).log_location
        file_path = f"/tmp/{jobid}_ct_log.tar.gz"
        pobj = subprocess.Popen(
            f'tar -czf {file_path} {log_path}', stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        pobj.wait()
        out, err = pobj.communicate()
        if pobj.returncode != 0:
            msg = f"Unable to compress log folder for {jobid}: out:{out} err:{err}"
            logger.error(msg)
            raise Exception(msg)
        return file_path

    def interrupt_running_process(self, jobid, pid, hash_):
        try:
            # Parent process started is a combination of python + 'rc' fetch
            # cmd with echo. So issuing interrupt has to be done to the first
            # child in its children list.
            parent_proc_obj = psutil.Process(pid)
            child_proc = parent_proc_obj.children()[0]
            if not hash_ in " ".join(child_proc.cmdline()):
                raise Exception(f'Hash not found in mentioned processID {pid}')
            child_proc.send_signal(signal.SIGINT)
            logger.info(f"Interrupt signal successfull for job {jobid} and process {pid} with {hash_}")
            return (True, 'Interrupt signal sent')
        except Exception as what:
            logger.error(f"Failed to interrupt job {jobid} and process {pid} with {hash_}. {what}")
            return (False, what)

    def __del__(self):
        logger.info('Exiting CT manager object')
        self.exit_proc_monitor = True
