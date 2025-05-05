
import json
import signal
import atexit
import logging
import subprocess

import psutil

LOGFILE = "/home/hstctest/ct_gui/ct_py/serve.log"

logging.basicConfig(level=logging.INFO, filename=LOGFILE, format="%(asctime)s %(levelname)-8s %(msg)s")

class CT_GUI_Monitor():
    def __init__(self, json_config):
        self.pobj = None
        self.KILL_SIGNAL = False
        self.process_started = False
        self.log_file = json_config["paths"]["log"]
        #self.cmd = f"nohup /home/hstctest/ct_gui/ct_py/bin/node /home/hstctest/ct_gui/ct_py/bin/serve -s /home/hstctest/ct_gui/Power_HST_CT_UI/frontend/build/ -p 3001 2>&1 >> {self.log_file}"
        #self.cmd = f"nohup {json_config['paths']['node']} {json_config['paths']['serve']} -s {json_config['paths']['build']} -p 3001 2>&1 >> {self.log_file}"
        self.cmd = f"nohup {json_config['paths']['node']} {json_config['paths']['serve']} -s {json_config['paths']['build']} -p {json_config['port']} --ssl-cert /home/Abhishek.Katam/Power_HST_CT_UI/frontend/certificates/cert.pem --ssl-key /home/Abhishek.Katam/Power_HST_CT_UI/frontend/certificates/key_no_pass.pem 2>&1 >> {self.log_file}"
        #self.cmd = f"nohup {json_config['paths']['node']} {json_config['paths']['serve']} -s {json_config['paths']['build']} -p {json_config['port']} --ssl-cert /home/Abhishek.Katam/Power_HST_CT_UI/frontend/certificates/caintermediatecert.der  2>&1 >> {self.log_file}"

    def write_to_file(self, out, err="", rc=0):
        proc_rc = f"""
        RC: {rc}"""
        stdout = f"""
        STDOUT: {out}"""
        stderr = f"""
        STDERR: {err}"""
        data = ""
        data = (data + proc_rc) if rc else data
        data = (data + stdout) if (rc or err) else (data + f"{out}\n")
        data = (data + stderr) if err else data
        with open(self.log_file, 'a') as fobj:
            fobj.write(data)

    def start_ct_gui(self):
        while not self.KILL_SIGNAL:
            if not self.process_started:
                logging.info("####################### Starting monitor for CT GUI #######################")
            else:
                logging.warning("GUI process killed. Restarting")
            pobj = subprocess.Popen(self.cmd, shell=True, start_new_session=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            self.process_started = True
            self.pobj = pobj
            logging.info("Monitoring process")
            pobj.wait()
            logging.error("Process down")
            stdout, stderr = pobj.communicate()
            logging.info(f"""
                RC: {pobj.returncode}
                STDOUT:{stdout},
                STDERR: {stderr}, 
            """)
        logging.info("Exiting GUI monitor")

    def interrupt_process(self, signum, frame):
        logging.warning("GUI interrupt signal received. Killing process")
        self.KILL_SIGNAL = True
        procObj = psutil.Process(self.pobj.pid)
        chilProcs = procObj.children(recursive=True)
        for proc in chilProcs:
            proc.send_signal(signal.SIGTERM)
        procObj.send_signal(signal.SIGTERM)
        self.pobj.kill()

    def register_for_signals(self):
        signal.signal(signal.SIGINT, self.interrupt_process)
        signal.signal(signal.SIGABRT, self.interrupt_process)
        signal.signal(signal.SIGTERM, self.interrupt_process)
        

if __name__ == "__main__":
    with open('config.json') as fobj:
        json_config = json.load(fobj)
    monitorObj = CT_GUI_Monitor(json_config["front_end"])
    monitorObj.register_for_signals()
    fobj = lambda: monitorObj.interrupt_process('signum','frame')
    atexit.register(fobj)
    monitorObj.start_ct_gui()
