import os
import json
import logging
import importlib.util
import sys
from django.http import FileResponse, Http404
from django.contrib.auth.models import User
from django.http.response import HttpResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes

from hst_ct_app import ct_manager
from hst_ct_app.models import Tests
from hst_ct_app.models import Utilities
from hst_ct_app import settings_ct_app
import sys
sys.path.append('/Auto/latest/robot/libraries/')
import power_releases as p
#from . import power_releases as p
from hst_ct_app.permissions import CustomIsAuthenticated

CTobj = ct_manager.CTManager()
logger = logging.getLogger(__name__)

from hst_ct_app import ct_manager_utilities
CTobjuti = ct_manager_utilities.CTManager()

@api_view(['GET'])
def list_power_releases(request):
    """
    Test utility to list the Power 09 / 10 Releases
    """
    firm_type = request.GET.get('firm_type')
    hmc_name = request.GET.get('HMC_NAME')
    server_name = request.GET.get('FULL_FSP_HOSTNAME')
   # arg_len = len(sys.argv)
    # if arg_len >= 2:
    #     hmc_name = sys.argv[1]
    #     if arg_len >= 3:
    #         server_name = sys.argv[2]
    # pobj = p.power_releases()
    data = CTobjuti.power_releases_helper(firm_type,hmc_name,server_name)
     # Check if the response contains an error key
    if isinstance(data, dict) and "error" in data:
        return JsonResponse(data)  # Return error dictionary directly

    # Handle successful list response
    return JsonResponse(data, safe=False)  # Safe=False for list responses
    

# @permission_classes([CustomIsAuthenticated])
@api_view(['GET'])
def list_test_dir(request):
    """
    List all robot test dirs and their yaml input files.
    Result is cached in a instance variable and used for subsequent calls.
    """
    type = request.GET.get('type', '')
    value = request.GET.get('value', '')
    return JsonResponse(CTobj.list_ct_test_dir(type, value), safe=False)


# @permission_classes([CustomIsAuthenticated])
@api_view(['GET'])
def refresh_list_test_dir(request):
    """
    Return a refreshed YAML TC directory results
    """
    type = request.GET.get('type', '')
    value = request.GET.get('value', '')
    return JsonResponse(CTobj.list_ct_test_dir(type, value, refresh=True), safe=False)


# @permission_classes([CustomIsAuthenticated])
@api_view(['GET'])
def fetch_yaml_content(request, test_dir, yaml_file):
    """
    List YAML file content as JSON response
    """
    type_data = {}
    if request.GET.get('get_input_type') and request.GET.get('get_input_type') == "true":
        type_data = settings_ct_app.CT_INPUT_DEFAULT_TYPES
    data = CTobj.fetch_ct_yaml_content(test_dir, yaml_file)
    final_data = {'yaml_data': data, 'type_data':type_data}
    if not data:
        return Http404(f'File {test_dir}/{yaml_file} does not exist or has no content')
    return JsonResponse(final_data)


def __format_post_data(format_data):
    """
    Format user input types to actual value types accepted in backend
    """
    ret_data = {}
    expected_types = settings_ct_app.CT_INPUT_DEFAULT_TYPES

    def convert_type(type_func, type_str, k, v, default):
        """
        Helper function for type conversion
        """
        try:
            if isinstance(v, str):
                v = v.strip()
            if not format_data[k]:
                # Check if there is a default value specified in the expected input list
                if 'default' in expected_types[k]:
                    ret_data[k] = expected_types[k]['default']
                else:
                    ret_data[k] = default
            elif type_func is list:
                list_v = [i.strip() for i in v.split(',')]
                ret_data[k] = list_v
            elif type_func is bool:
                ret_data[k] = True if v in (
                    'True', 'true', 'TRUE', 'Yes', 'yes', 'YES') else False
            else:
                ret_data[k] = type_func(v) if type_func is not None else v
        except Exception as what:
            logger.error(
                f"Can't type cast {k} to expected type {type_str}: {what}. Setting as is")
            ret_data[k] = v

    for k, v in format_data.items():
        if k not in expected_types:
            logger.warning(
                f"{k} is not in known expected_type dict. Using unformatted value {v}")
            ret_data[k] = v
        elif expected_types[k]['type'] == 'str':
            convert_type(str, 'str', k, v, '')
        elif expected_types[k]['type'] == 'NoneType':
            convert_type(None, 'None', k, v, None)
        elif expected_types[k]['type'] == 'int':
            convert_type(int, 'int', k, v, None)
        elif expected_types[k]['type'] == 'float':
            convert_type(float, 'float', k, v, None)
        elif expected_types[k]['type'] == 'bool':
            convert_type(bool, 'bool', k, v, False)
        elif expected_types[k]['type'] == 'list':
            convert_type(list, 'list', k, v, [])

    return ret_data


def _get_or_create_user(user_data):
    """
    Return user object based on user email else create one if doesn't exists
    """
    if 'HTTP_MAIL' not in user_data:
        raise Exception('User info not found. Unable to perform task')
    all_users = User.objects.all()
    for user_ in all_users:
        if user_.email == user_data['HTTP_MAIL']:
            break
    else:
        user_info = {
            'username': user_data["HTTP_MAIL"].split('@')[0],
            'email': user_data["HTTP_MAIL"],
            'first_name': user_data["HTTP_FIRSTNAME"],
            'last_name': user_data["HTTP_LASTNAME"]
        }
        user_ = User.objects.create(**user_info)
        logger.info(f'Created user: {user_}')
    return user_

# @permission_classes([CustomIsAuthenticated])


@api_view(['POST'])
def submitTest(request):
    if not request.method == "POST":
        raise Exception("Invalid method type.Should be a POST type request")
    actual_post_data = request.data
    user_ = _get_or_create_user(request.META)

    actual_post_data['yaml_inputs'] = __format_post_data(
        actual_post_data['yaml_inputs'])
    actual_post_data['cust_yaml_inputs'] = __format_post_data(
        actual_post_data['cust_yaml_inputs'])
    logger.debug(actual_post_data)

    data = CTobj.start_ct_test(actual_post_data, user_)

    if data['pid'] == 0:
        msg = f"Failed to start task for {actual_post_data['yaml_file']}"
        logger.error(msg)
        return HttpResponse(msg, status=400)
    test_data = {
        'user': user_,
        'proc_id': data['pid'],
        'proc_hash': data['hash'],
        'log_location': data['log_dir'],
        'test_category': actual_post_data['yaml_category'],
        'test_function': actual_post_data['yaml_file'].split('.')[0],
        'ter_id': str(actual_post_data['yaml_inputs'].get('TER_ID', '')),
        'sp_name': actual_post_data['yaml_inputs'].get('FULL_FSP_HOSTNAME', '')
    }
    if data['rc']:
        test_data.update({
            'test_status': settings_ct_app.CT_TEST_STATUS['FAIL'][0]
        })
    else:
        test_data.update({
            'test_status': settings_ct_app.CT_TEST_STATUS['RUNNING'][0]
        })
    new_test = Tests(**test_data)
    new_test.save()
    CTobj.add_process_for_monitor(data['pid'], data['hash'], new_test.pk)
    logger.info(
        f"Started task with id:{new_test.pk} for pid:{data['pid']} with hash:{data['hash']}")

    return JsonResponse({
        'submitted': True,
        'pid': data['pid'],
        'hash': data['hash'],
        'jobid': new_test.pk
    })
#utility function called on submitting.
#changed test_data - test_category to utility, send differently from frontend
@api_view(['POST'])
def submitUtility(request):
    if not request.method == "POST":
        raise Exception("Invalid method type.Should be a POST type request")
    #print('hello from submitUtility')
    
    actual_post_data = request.data
    user_ = _get_or_create_user(request.META)
    actual_post_data['yaml_inputs'] = __format_post_data(
        actual_post_data['yaml_inputs'])
    logger.debug(actual_post_data)
    #print(actual_post_data)
    print('hello from submitUtility2')
    
    #changed func
    data = CTobjuti.start_ct_test_utility(actual_post_data, user_)
    print(f"pid of data is ${data['pid']}")
    if data['pid'] == 0:
        print('pid is 0 so exiting with status=400')
        msg = f"Failed to start task for {actual_post_data['yaml_file']}"
        logger.error(msg)
        return HttpResponse(msg, status=400)
    test_data = {
        'user': user_,
        'proc_id': data['pid'],
        'proc_hash': data['hash'],
        'log_location': data['log_dir'],
        'utility': actual_post_data['utility_category'],
        'sp_name': actual_post_data['yaml_inputs'].get('FULL_FSP_HOSTNAME', '')
    }
    print(test_data)

    if data['rc']:
        test_data.update({
            'test_status': settings_ct_app.CT_TEST_STATUS['FAIL'][0]
        })
    else:
        test_data.update({
            'test_status': settings_ct_app.CT_TEST_STATUS['RUNNING'][0]
        })
    
    new_test = Utilities(**test_data)
    new_test.save()
    #changed func
    CTobjuti.add_process_for_monitor_utility(data['pid'], data['hash'], new_test.pk)
    logger.info(
        f"Started task with id:{new_test.pk} for pid:{data['pid']} with hash:{data['hash']}")

    return JsonResponse({
        'submitted': True,
        'pid': data['pid'],
        'hash': data['hash'],
        'jobid': new_test.pk
    })



# @permission_classes([CustomIsAuthenticated])
@api_view(['GET'])
def get_all_jobs(request, jobid=0):
    limit = int(request.GET.get('limit'))
    offset = int(request.GET.get('offset'))
    status = request.GET.get('status')
    user = request.GET.get('user','')
    user = '' if user == "ALL" else user
    if status == "ALL" and not user:
        jobs = Tests.objects.all().order_by('-id')[offset:limit]
        count = Tests.objects.all().count()
    elif status == "ALL" and user:
        jobs = Tests.objects.filter(user__username=user).order_by('-id')
        count = len(jobs)
        jobs = jobs[offset:limit]
    elif status != "ALL" and not user:
        jobs = Tests.objects.filter(
            test_status=status).order_by('-id')[offset:limit]
        count = Tests.objects.filter(test_status=status).count()
    else:
        jobs = Tests.objects.filter(
            test_status=status, user__username=user).order_by('-id')[offset:limit]
        count = len(jobs)
        jobs = jobs[offset:limit]
    pageCount = (count//(limit-offset)) if (count %
                                            (limit-offset) == 0) else (count//(limit-offset)) + 1
    final_data = {'job_data': [], 'job_log': {},
                  'limit': limit, 'offset': offset, 'pageCount': pageCount}
    for job in jobs:
        info = {
            'id': job.id,
            'user': job.user.username,
            'status': job.test_status,
            'start_time': job.start_time,
            'end_time': job.end_time,
            'tp_func': job.test_function,
        }
        final_data['job_data'].append(info)
        if jobid == 0:
            continue

    # Fetch log of the job
    if jobid != 0:
        final_data['job_log'].update(CTobj.get_live_log_data(jobid))

    return JsonResponse(final_data)

@api_view(['GET'])
def get_all_utilities(request, jobid=0):
    limit = int(request.GET.get('limit'))
    offset = int(request.GET.get('offset'))
    user = request.GET.get('user','')
    user = '' if user == "ALL" else user
    jobs = Utilities.objects.all().order_by('-id')[offset:limit]
    count = Utilities.objects.all().count()
    pageCount = (count//(limit-offset)) if (count %
                                            (limit-offset) == 0) else (count//(limit-offset)) + 1
    final_data = {'job_data': [], 'job_log': {},
                  'limit': limit, 'offset': offset, 'pageCount': pageCount}
    for job in jobs:
        info = {
            'id': job.id,
            'user': job.user.username,
            'utility_category':job.utility,
            'status': job.test_status,
            'start_time': job.start_time,
            'end_time': job.end_time,    
        }
        final_data['job_data'].append(info)
        if jobid == 0:
            continue

    # Fetch log of the job
    if jobid != 0:
        final_data['job_log'].update(CTobjuti.get_live_log_data_utilities(jobid))

    return JsonResponse(final_data)
    


# @permission_classes([CustomIsAuthenticated])
@api_view(['GET'])
def get_jobdata(request, jobid):
    return JsonResponse(CTobj.get_live_log_data(jobid))

@api_view(['GET'])
def get_utilityjobdata(request, jobid):
    print('get_utilityjobdata')
    return JsonResponse(CTobjuti.get_live_log_data_utilities(jobid))

# @permission_classes([CustomIsAuthenticated])
@api_view(['GET'])
def downloadLogs(request, jobid):
    path = CTobj.compress_log_data(jobid)
    file_name = path.split(os.path.sep)[-1]
    response = FileResponse(
        open(path, 'rb'), as_attachment=True, filename=file_name)
    response['Content-Type'] = "application/octet-stream"
    return response


# @permission_classes([CustomIsAuthenticated])
@api_view(['POST'])
def interruptRunningTest(request, jobid):
    """
    Send an interrupt signal to stop a process gracefully
    """
    obj = Tests.objects.get(id=jobid)
    proc_id = obj.proc_id
    hash = obj.proc_hash
    user_ = _get_or_create_user(request.META)

    if (obj.user != user_):
        return HttpResponse(f'Process interrupt failed for {jobid}. You are not authorized to terminate a job started by {obj.user.username}', status=401)

    status, msg = CTobj.interrupt_running_process(jobid, proc_id, hash)
    if status:
        obj.test_status = settings_ct_app.CT_TEST_STATUS['TERMINATING'][0]
        obj.save(update_fields=['test_status'])
        return HttpResponse(f'Process interrupt signal issued for {jobid}. Termination in progress')
    else:
        return HttpResponse(f'Process interrupt failed for {jobid}. {msg}', status=400)
