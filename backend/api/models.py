# models.py

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password

class Conexion(models.Model):
    name = models.CharField(max_length=255)
    host = models.CharField(max_length=255)
    db_type = models.CharField(max_length=255)
    port = models.IntegerField()
    dbname = models.CharField(max_length=255)
    user = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    info_adicional = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='uploads/', null=True, blank=True)

    def __str__(self):
        return self.name
    
class SQLExecution(models.Model):
    user = models.CharField(max_length=100)
    bbdd = models.CharField(max_length=100)
    query = models.TextField()
    executed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.bbdd} - {self.executed_at}"
