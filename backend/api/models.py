# models.py

from django.db import models

class Conexion(models.Model):
    name = models.CharField(max_length=255)
    host = models.CharField(max_length=255)
    db_type = models.CharField(max_length=255)
    port = models.IntegerField()
    dbname = models.CharField(max_length=255)
    user = models.CharField(max_length=255)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.name
