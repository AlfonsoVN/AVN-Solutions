# views.py

import json
import os
import random
from django.conf import settings
from django.db import IntegrityError
from sqlalchemy.exc import OperationalError
from django.http import JsonResponse
from django.shortcuts import redirect, render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from sqlalchemy import create_engine, text, func
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from .forms import ConexionForm

from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Conexion  # Asegúrate de tener este modelo definido
from .serializers import ConexionSerializer
from .utils import obtener_conexion  # Importa las funciones desde utils

from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password

from .groq_service import GroqService

class RegisterUser(APIView):
    def post(self, request):
        data = request.data
        name = data.get('name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')

        if not name or not email or not password:
            return Response({'error': 'Nombre, Correo y Contraseña son obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        # Asegúrate de no tener un correo duplicado
        if User.objects.filter(email=email).exists():
            return Response({'error': 'El correo electrónico ya está en uso'}, status=status.HTTP_400_BAD_REQUEST)

        # Crear el usuario usando el modelo User de Django
        user = User.objects.create_user(
            username=email,  # El email será el username
            email=email,
            password=password,
            first_name=name,  # Usamos el campo first_name para el nombre del usuario
            last_name=last_name
        )

        return Response({'success': 'Usuario registrado correctamente'}, status=status.HTTP_201_CREATED)

def api_root(request):
    """
    Vista que devuelve un resumen de los endpoints disponibles en la API.
    """
    return JsonResponse({
        'obtener_conexion': 'http://127.0.0.1:8000/api/obtener_conexion/',
        'añadir_conexion': 'http://127.0.0.1:8000/api/anadir_conexion/',
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_connections(request):
    user_email = request.user.email
    
    conexiones = Conexion.objects.filter(name__contains=user_email)
    
    # Serializar los datos
    serializer = ConexionSerializer(conexiones, many=True)
    
    # Modificar los datos serializados
    modified_data = []
    for item in serializer.data:
        # Suponiendo que el formato es "email ~ nombre_base_datos"
        name_parts = item['name'].split(' ~ ')
        if len(name_parts) > 1:
            item['name'] = name_parts[1]  # Solo el nombre de la base de datos
        modified_data.append(item)
    
    return Response(modified_data)


@api_view(['DELETE'])
def delete_connection(request, pk):
    try:
        # Intentamos obtener la conexión por su id (pk)
        conexion = Conexion.objects.get(pk=pk)
        conexion.delete()  # Eliminar la conexión
        return Response({"mensaje": "Conexión eliminada correctamente"}, status=status.HTTP_204_NO_CONTENT)
    except Conexion.DoesNotExist:
        return Response({"mensaje": "Conexión no encontrada"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['PUT'])
def edit_connection(request, pk):
    try:
        connection = Conexion.objects.get(pk=pk)
    except Conexion.DoesNotExist:
        return Response({'mensaje': 'Conexión no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ConexionSerializer(connection, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'mensaje': 'Conexión actualizada correctamente'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def get_user_details(request, user_id):
    try:
        user = User.objects.get(id=user_id)  # Usamos el modelo User de Django
        return JsonResponse({
            'email': user.email,
            'last_name': user.last_name,
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
    

@api_view(['POST'])  # Asegura que solo acepte POST
def test_connection(request):
        
    print("Headers:", request.headers)
    print("Body recibido:", request.body)

    

    try:
        # Obtener los datos del cuerpo de la solicitud
        data = json.loads(request.body.decode('utf-8'))  # Leer JSON desde request.body
        # Recoger los datos del formulario
        connection2=Conexion()
        connection2.host=data.get('host')
        connection2.db_type=data.get('db_type')
        connection2.name=data.get('name')
        connection2.user=data.get('user')
        connection2.port=data.get('port')
        connection2.password=data.get('password')
        connection2.dbname=data.get('dbname')
        
        # Crear la URL de conexión usando la función 'obtener_conexion'
        db_url = obtener_conexion(connection2)
        
        # Intentar crear una conexión con la base de datos
        engine = create_engine(db_url)
        print(engine)
            
        # Intentar conectarse y verificar la conexión
        with engine.connect() as connection:
            connection.execute(text('SELECT 1'))  # Esto es solo una consulta simple para comprobar la conexión        
        return JsonResponse({'exito': True, 'mensaje': 'Conexión exitosa'})
    
    except OperationalError as e:
        # Si ocurre un error de conexión, devolver el error
        return JsonResponse({'exito': False, 'mensaje': f'Error al conectar con la base de datos: {str(e)}'}, status=400)

    except Exception as e:
        # Cualquier otro error
        return JsonResponse({'exito': False, 'mensaje': str(e)}, status=400)


@api_view(['POST'])  # Asegura que solo acepte POST
@permission_classes([IsAuthenticated])
def anadir_conexion(request):
    try:

        # 🚨 Imprimir el contenido del request para depuración
        print("Headers:", request.headers)
        print("Body recibido:", request.body)

        data = json.loads(request.body.decode('utf-8'))  # Leer JSON desde request.body

        user_identifier = request.user.email if request.user.email else request.user.username

        connection_name = f"{user_identifier } ~ {data.get('name')}"

        conexion_existente = Conexion.objects.filter(
            name=connection_name,
            host=data.get('host'),
            db_type=data.get('db_type'),
            dbname=data.get('dbname'),
            user=data.get('user'),
            port=data.get('port'),
            password=data.get('password'),
        ).first()

        # Si la conexión ya existe, retornar un error
        if conexion_existente:
            return JsonResponse({'exito': False, 'mensaje': 'Ya existe una conexión con estos parámetros.'}, status=400)

        nueva_conexion = Conexion.objects.create(
            name=connection_name,
            host=data.get('host'),
            db_type=data.get('db_type'),
            port=int(data.get('port')),
            dbname=data.get('dbname'),
            user=data.get('user'),
            password=data.get('password'),
        )

        return JsonResponse({'exito': True})

    except IntegrityError as e:
        # Si hay un error de integridad, devolver el error
        return JsonResponse({'exito': False, 'mensaje': str(e)}, status=400)

    except Exception as e:
        # Cualquier otro error
        return JsonResponse({'exito': False, 'mensaje': str(e)}, status=400)



@csrf_exempt
def chat_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        prompt = data.get('prompt')
        database_id = data.get('databaseId')
        
        # Aquí iría tu lógica para procesar el prompt y obtener una respuesta
        # Por ahora, solo devolveremos un eco del mensaje
        
        response = f"Recibido: {prompt} para la base de datos {database_id}"
        
        return JsonResponse({'response': response})
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)
