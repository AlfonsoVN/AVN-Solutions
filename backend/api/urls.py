# urls.py
from django.urls import path
from . import views
from .views import obtener_conexion, anadir_conexion, api_root, test_connection, RegisterUser, get_user_details
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('', api_root, name='api_root'),  # Ruta para la raíz de la API
    path('test_connection/', test_connection, name='test_connection'),  # Ruta para la vista test_connection
    path('obtener_conexion/', obtener_conexion, name='obtener_conexion'),
    path('anadir_conexion/', anadir_conexion, name='anadir_conexion'),
    path('get-connections/', views.get_connections, name='get_connections'),
    path('delete-connection/<int:pk>/', views.delete_connection, name='delete_connection'),
    path('edit-connection/<int:pk>/', views.edit_connection, name='edit_connection'),
    path('register/', RegisterUser.as_view(), name='register_user'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/<int:user_id>/', get_user_details, name='get_user_details'),
    path('chat_view/', views.chat_view, name='chat_view'),
    path('execute_dangerous_query/', views.execute_dangerous_query, name='execute_dangerous_query'),
    path('dangerous-queries/', views.get_dangerous_queries, name='get_dangerous_queries'),
    path('users/', views.get_users, name='get_users'),
    path('test-database-query/', views.test_database_query, name='test_database_query'),

]


