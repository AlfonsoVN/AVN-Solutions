# serializers.py

from rest_framework import serializers
from .models import Conexion

class ConexionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conexion
        fields = ['nombre', 'host', 'puerto', 'dbname', 'usuario', 'contrasena', 'db_type']
