# Generated by Django 5.1.7 on 2025-03-26 10:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_conexion_delete_databaseconnection'),
    ]

    operations = [
        migrations.RenameField(
            model_name='conexion',
            old_name='puerto',
            new_name='port',
        ),
        migrations.RenameField(
            model_name='conexion',
            old_name='usuario',
            new_name='user',
        ),
    ]
