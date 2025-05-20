from rest_framework import serializers
from .models import Conexion, DangerousQuery

class ConexionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conexion
        fields = '__all__'


class DangerousQuerySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = DangerousQuery
        fields = ['id', 'username', 'query', 'executed_at']