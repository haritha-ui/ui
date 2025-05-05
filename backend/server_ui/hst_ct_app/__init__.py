
import os
import logging

from . import settings_ct_app

if not os.path.exists(settings_ct_app.CT_LOG_FOLDER):
    os.makedirs(settings_ct_app.CT_LOG_FOLDER, exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'file': {
            'format': '%(asctime)s %(name)-21s %(levelname)-8s %(message)s'
        }
    },
    'handlers': {
        'hst_file_handler': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'formatter': 'file',
            'filename': settings_ct_app.CT_LOGGING_FILE
        }
    },
    'loggers': {
        'hst_ct_app': {
            'level': 'INFO',
            'handlers': ['hst_file_handler']
        }
    }
}

logging.config.dictConfig(LOGGING)
