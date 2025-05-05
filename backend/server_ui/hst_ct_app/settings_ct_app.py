
import os
import json

CT_DIR_PATH = '/Auto/latest' if os.name == "posix" else "C:\\dev\\Power-HST-Automation"
CT_ROBOT_PATH = os.path.join(CT_DIR_PATH, 'robot')

CT_ROBOT_FOLDERS = [
    'FW_Function',
    'FW_Function_CFM',
    'HW_Function',
    'IO_and_Media',
    'MAX_LPAR',
    'Predictive_Gard',
    'Security',
    'Virtualization',
    'cloud',
    'RAS',
    'Service_Pack'
]


CT_LOG_FOLDER = "/ctlogs" if os.name == "posix" else "C:\\ctlogs"
CT_TEST_LOG_PATH = f"{CT_LOG_FOLDER}/test_logs" if os.name == "posix" else f"{CT_LOG_FOLDER}\\test_logs"
CT_UTILITIES_LOG_PATH = f"{CT_LOG_FOLDER}/utilities_logs" if os.name == "posix" else f"{CT_LOG_FOLDER}\\utilities_logs"

CT_TEST_STATUS = {
    'PASS': ('PASS', 'Pass'),
    'FAIL': ('FAIL', 'Fail'),
    'RUNNING': ('RUNNING', 'Running'),
    'TERMINATED': ('TERMINATED', 'Terminated'),
    'TERMINATING': ('TERMINATING', 'Terminating'),  # Process 'I'nterrupted
    'UNKNOWN': ('UNKNOWN', 'Unknown')
}
UTILITY_TYPE = {
    'FIRMWARE' : ('FIRMWARE','Firmware')
}
CT_RUN_TYPE = {
    'SINGLE': ('SINGLE', 'Single'),
    'BUCKET': ('BUCKET', 'Bucket')
}

CT_PROC_MONITOR_TIMEOUT = 5

cur_dir = os.path.dirname(os.path.realpath(__file__))
CT_INPUT_DEFAULT_TYPES = json.load(open(os.path.join(cur_dir, 'input_type_cast.json'), 'r'))

CT_LOGGING_FILE = f"{CT_LOG_FOLDER}/ct_logs.log" if os.name == "posix" else f"{CT_LOG_FOLDER}\\ct_logs.log"