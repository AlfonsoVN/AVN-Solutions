# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/comprobar_conexion/', views.comprobar_conexion, name='comprobar_conexion'),
    path('api/añadir_conexion/', views.añadir_conexion, name='añadir_conexion'),
]
