# Generated by Django 3.2.13 on 2022-06-20 11:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hst_ct_app', '0002_rename_user_id_tests_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tests',
            name='end_time',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
