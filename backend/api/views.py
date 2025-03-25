# views.py
from django.http import JsonResponse
import mysql.connector
from mysql.connector import Error
from .models import Conexion

def comprobar_conexion(request):
    if request.method == "POST":
        data = request.POST
        try:
            connection = mysql.connector.connect(
                host=data.get('host'),
                port=data.get('puerto'),
                user=data.get('usuario'),
                password=data.get('contrasena'),
                database=data.get('dbname')
            )
            if connection.is_connected():
                return JsonResponse({'exito': True})
        except Error as e:
            return JsonResponse({'exito': False, 'mensaje': str(e)})
        finally:
            if connection.is_connected():
                connection.close()
    return JsonResponse({'exito': False, 'mensaje': 'Método no permitido'}, status=405)


def añadir_conexion(request):
    if request.method == "POST":
        data = request.POST
        try:
            # Guardar la conexión en la base de datos
            nueva_conexion = Conexion.objects.create(
                nombre=data.get('nombre'),
                host=data.get('host'),
                puerto=data.get('puerto'),
                dbname=data.get('dbname'),
                usuario=data.get('usuario'),
                contrasena=data.get('contrasena'),
            )
            return JsonResponse({'exito': True})
        except Exception as e:
            return JsonResponse({'exito': False, 'mensaje': str(e)})
    return JsonResponse({'exito': False, 'mensaje': 'Método no permitido'}, status=405)