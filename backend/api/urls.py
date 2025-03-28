# urls.py
from django.urls import path
from . import views
from .views import obtener_conexion, anadir_conexion, api_root, test_connection, RegisterUser

urlpatterns = [
    path('', api_root, name='api_root'),  # Ruta para la raíz de la API
    path('test_connection/', test_connection, name='test_connection'),  # Ruta para la vista test_connection
    path('obtener_conexion/', obtener_conexion, name='obtener_conexion'),
    path('anadir_conexion/', anadir_conexion, name='anadir_conexion'),
    path('get-connections/', views.get_connections, name='get_connections'),
    path('delete-connection/<int:pk>/', views.delete_connection, name='delete_connection'),
    path('edit-connection/<int:pk>/', views.edit_connection, name='edit_connection'),
    path('register/', RegisterUser.as_view(), name='register_user')
]

