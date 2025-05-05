from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    # TokenVerifyView,
    # TokenRefreshView,
)

from . import views

urlpatterns = [
    path('list_test_dir', views.list_test_dir, name='index'),
    path('refresh_list_test_dir',
         views.refresh_list_test_dir, name='refresh_index'),
    path('fetch_yaml_data/<test_dir>/<yaml_file>',
         views.fetch_yaml_content, name='yamlData'),
    path('tests/submit', views.submitTest, name='submitTest'),
    path('tests/<int:jobid>', views.get_all_jobs, name='get_all_jobs'),
    path('tests/log/<int:jobid>', views.get_jobdata, name='get_jobdata'),
    path('download_log/<int:jobid>', views.downloadLogs, name='download_log'),
    path('tests/terminate/<int:jobid>',
         views.interruptRunningTest, name='interrupt_test'),
    path('utilities/submit', views.submitUtility, name='submitUtility'),
    path('utilities/<int:jobid>', views.get_all_utilities, name='get_all_utilities'),
    path('utilities/log/<int:jobid>', views.get_utilityjobdata, name='get_utilityjobdata'),
    path('utilities/listbuilds', views.list_power_releases, name='list_power_releases'),
    #path('utilities/<str:firm_type>/<str:hmc_name>/<str:server_name>',views.list_power_releases, name='list_power_releases'),

    # Authentication URL paths
    path('api/token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    #path('api/token/verify', TokenVerifyView.as_view(), name='token_verify'),
    #path('api/token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
]
