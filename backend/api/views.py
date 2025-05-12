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

from .models import Conexion, SQLExecution  # Asegúrate de tener este modelo definido
from .serializers import ConexionSerializer
from .utils import obtener_conexion  # Importa las funciones desde utils

from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password

from .groq_service import GroqService
import groq
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session

from datetime import datetime, date
from decimal import Decimal
import pandas as pd


import re

import logging
logger = logging.getLogger(__name__)

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



client = groq.Client(api_key=settings.GROQ_API_KEY)

def extract_sql_structure(connection):
    db_url = obtener_conexion(connection)
    engine = create_engine(db_url)
    inspector = inspect(engine)
    
    sql_structure = ""
    for table_name in inspector.get_table_names():
        sql_structure += f"Table: {table_name}\n"
        for column in inspector.get_columns(table_name):
            sql_structure += f"  Column: {column['name']} - {column['type']}\n"
    
    return sql_structure

def execute_sql_query(connection, query):
    db_url = obtener_conexion(connection)
    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        result = conn.execute(text(query))
        if result.returns_rows:
            columns = result.keys()
            rows = []
            for row in result:
                row_dict = {}
                for idx, column in enumerate(columns):
                    value = row[idx]
                    if isinstance(value, (datetime, date)):
                        value = value.isoformat()
                    elif isinstance(value, Decimal):
                        value = float(value)
                    elif not isinstance(value, (str, int, float, bool, type(None))):
                        value = str(value)
                    row_dict[column] = value
                rows.append(row_dict)
            
            return {
                'columns': list(columns),
                'rows': rows
            }
        else:
            return "Consulta ejecutada con éxito."




def is_safe_query(query):
    # Verificar si la consulta es un SELECT
    return query.strip().lower().startswith('select')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_view(request):
    logger.info("Recibida solicitud en chat_view")
    if request.method == 'POST':
        data = json.loads(request.body)
        prompt = data.get('prompt')
        database_id = data.get('databaseId')

        logger.info(f"Prompt recibido: {prompt}")
        logger.info(f"Database ID: {database_id}")
        
        try:
            connection = Conexion.objects.get(id=database_id)
            db_structure = extract_sql_structure(connection)
            
            if not db_structure:
                return JsonResponse({'error': 'No se pudo obtener la estructura de la base de datos'}, status=500)
            
            system_message = (
                f"Eres un asistente útil que SIEMPRE responde en español. El usuario está trabajando con la base de datos con ID {database_id}. "
                f"A continuación se muestra la estructura de la base de datos:\n\n{db_structure}\n\n"
                "Ten siempre en cuenta esta estructura de base de datos en tus respuestas y utilízala para proporcionar información precisa. "
                "Si el usuario pide ver registros o ejecutar una consulta, proporciona la consulta SQL apropiada entre comillas triples ```."
            )
            
            if connection.info_adicional:
                system_message += f"\nInformación adicional sobre la base de datos: {connection.info_adicional}"
            
            if connection.file:
                with open(f".\\media\\uploads\\{connection.file}", 'r', encoding="utf-8") as archivo_contenido:
                    contenido = archivo_contenido.read()
                system_message += f"\nContenido del archivo adjunto: {contenido}"
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.1-8b-instant", 
            )
            
            response = chat_completion.choices[0].message.content
            
            sql_match = re.search(r'```sql\n(.*?)\n```', response, re.DOTALL)
            if sql_match:
                suggested_query = sql_match.group(1).strip()
                is_safe = is_safe_query(suggested_query)
                try:
                    if is_safe:
                        result = execute_sql_query(connection, suggested_query)
                        SQLExecution.objects.create(
                            user=request.user.username, bbdd=connection.name, query=suggested_query, executed_at=datetime.now())
                        return JsonResponse({
                            'response': response,
                            'sql_result': result,
                            'show_only_table': True
                        })
                    else:
                        return JsonResponse({
                            'response': response,
                            'warning': 'La consulta sugerida no es un SELECT y puede modificar la base de datos.',
                            'suggested_query': suggested_query,
                            'needs_confirmation': True
                        })
                except Exception as e:
                    logger.error(f"Error al ejecutar la consulta SQL: {str(e)}", exc_info=True)
                    return JsonResponse({
                        'response': response,
                        'error': f"Error al ejecutar la consulta SQL: {str(e)}"
                    }, status=500)
            
            return JsonResponse({'response': response})
        except Conexion.DoesNotExist:
            return JsonResponse({'error': 'Conexión de base de datos no encontrada'}, status=404)
        except Exception as e:
            logger.error(f"Error en chat_view: {str(e)}", exc_info=True)
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def execute_dangerous_query(request):
    data = json.loads(request.body)
    query = data.get('query')
    database_id = data.get('databaseId')

    try:
        connection = Conexion.objects.get(id=database_id)
        db_url = obtener_conexion(connection)
        engine = create_engine(db_url)
        
        with engine.connect() as conn:
            # Ejecutar la consulta peligrosa
            conn.execute(text(query))
            conn.commit()
            
            # Obtener el nombre de la tabla afectada (asumiendo que es la primera palabra después de FROM, INTO o UPDATE)
            table_name = re.search(r'(FROM|INTO|UPDATE)\s+(\w+)', query, re.IGNORECASE)
            if table_name:
                table_name = table_name.group(2)
                
                # Consultar el contenido actual de la tabla
                result = conn.execute(text(f"SELECT * FROM {table_name}"))
                columns = result.keys()
                rows = []
                for row in result:
                    row_dict = {}
                    for idx, column in enumerate(columns):
                        value = row[idx]
                        if isinstance(value, (datetime, date)):
                            value = value.isoformat()
                        elif isinstance(value, Decimal):
                            value = float(value)
                        elif not isinstance(value, (str, int, float, bool, type(None))):
                            value = str(value)
                        row_dict[column] = value
                    rows.append(row_dict)
                
                result_data = {
                    'message': "Consulta ejecutada con éxito. Aquí muestro los cambios realizados: ",
                    'table_content': {
                        'columns': list(columns),
                        'rows': rows
                    }
                }
            else:
                result_data = {
                    'message': "Consulta ejecutada con éxito. No se pudo determinar la tabla afectada."
                }
        
        SQLExecution.objects.create(
            user=request.user.username, bbdd=connection.name, query=query, executed_at=datetime.now())
        return JsonResponse({'result': result_data})
    except Exception as e:
        logger.error(f"Error al ejecutar la consulta peligrosa: {str(e)}", exc_info=True)
        return JsonResponse({'error': str(e)}, status=500)
