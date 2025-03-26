from rest_framework import serializers
from .models import Conexion

class ConexionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conexion
        fields = '__all__'
