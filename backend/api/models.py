# models.py
from django.db import models

class Conexion(models.Model):
    nombre = models.CharField(max_length=255)
    host = models.CharField(max_length=255)
    puerto = models.IntegerField()
    dbname = models.CharField(max_length=255)
    usuario = models.CharField(max_length=255)
    contrasena = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre
