# urls.py
from django.urls import path
from . import views
from .views import obtener_conexion, añadir_conexion, api_root, test_connection  # Importa la nueva vista

urlpatterns = [
    path('', api_root, name='api_root'),  # Ruta para la raíz de la API
    path('test_connection/', test_connection, name='test_connection'),  # Ruta para la vista test_connection
    path('obtener_conexion/', obtener_conexion, name='obtener_conexion'),
    path('añadir_conexion/', añadir_conexion, name='añadir_conexion'),
]

