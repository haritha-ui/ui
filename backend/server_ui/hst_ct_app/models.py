from django.db import models
from . import settings_ct_app
from django.contrib.auth.models import User

# Create your models here.
class Tests(models.Model):
    class TestStatus(models.TextChoices):
        PASS = settings_ct_app.CT_TEST_STATUS['PASS']
        FAIL = settings_ct_app.CT_TEST_STATUS['FAIL']
        RUNNING = settings_ct_app.CT_TEST_STATUS['RUNNING']
        TERMINATED = settings_ct_app.CT_TEST_STATUS['TERMINATED']
        TERMINATING = settings_ct_app.CT_TEST_STATUS['TERMINATING']
        UNKNOWN = settings_ct_app.CT_TEST_STATUS['UNKNOWN']
    
    class TestRun(models.TextChoices):
        SINGLE = settings_ct_app.CT_RUN_TYPE['SINGLE']
        BUCKET = settings_ct_app.CT_RUN_TYPE['BUCKET']

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tcr_id = models.CharField(max_length=8, default='0')
    ter_id = models.CharField(max_length=8, default='0')
    tp_id = models.CharField(max_length=8, default='0')
    log_location = models.CharField(max_length=500, null=False, blank=False)
    test_status = models.CharField(max_length=11, choices=TestStatus.choices, default=TestStatus.RUNNING)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(auto_now=True)
    run_type = models.CharField(max_length=6, choices=TestRun.choices, default=TestRun.SINGLE)
    error_message = models.TextField('Error', default='', blank=True, null=True)
    sp_name = models.CharField('Service Processor', max_length=50)
    test_function = models.CharField(default='', max_length=30)
    test_category = models.CharField(default='', max_length=30)
    proc_id = models.IntegerField(default=0)
    proc_hash = models.CharField(max_length=50, default='')

    def __str__(self):
        return f"{self.proc_id} {self.test_status}"

class Utilities(models.Model):
    class TestStatus(models.TextChoices):
        PASS = settings_ct_app.CT_TEST_STATUS['PASS']
        FAIL = settings_ct_app.CT_TEST_STATUS['FAIL']
        RUNNING = settings_ct_app.CT_TEST_STATUS['RUNNING']
        TERMINATED = settings_ct_app.CT_TEST_STATUS['TERMINATED']
        TERMINATING = settings_ct_app.CT_TEST_STATUS['TERMINATING']
        UNKNOWN = settings_ct_app.CT_TEST_STATUS['UNKNOWN']

    class UtilityType(models.TextChoices):
        FIRMWARE = settings_ct_app.UTILITY_TYPE['FIRMWARE']

        
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    log_location = models.CharField(max_length=500, null=False, blank=False)
    test_status = models.CharField(max_length=11, choices=TestStatus.choices, default=TestStatus.RUNNING)
    utility = models.CharField(max_length=11, choices=UtilityType.choices, default=UtilityType.FIRMWARE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(auto_now=True)
    sp_name = models.CharField('Service Processor', max_length=50)
    proc_id = models.IntegerField(default=0)
    proc_hash = models.CharField(max_length=50, default='')

    def __str__(self):
        return f"{self.proc_id} {self.test_status}"
