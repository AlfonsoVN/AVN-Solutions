# views.py

import os
import random
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect, render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from sqlalchemy import create_engine, text

from .forms import ConexionForm

from .models import Conexion  # Asegúrate de tener este modelo definido
from .serializers import ConexionSerializer
from .utils import obtener_conexion  # Importa las funciones desde utils

def api_root(request):
    """
    Vista que devuelve un resumen de los endpoints disponibles en la API.
    """
    return JsonResponse({
        'obtener_conexion': 'http://127.0.0.1:8000/api/obtener_conexion/',
        'añadir_conexion': 'http://127.0.0.1:8000/api/añadir_conexion/',
    })

@api_view(['GET', 'POST'])
def test_connection(request):
    is_admin = request.user.is_superuser
    if request.method == 'POST':
        form = ConexionForm(request.POST, request.FILES)
        print(request.FILES) 
        if form.is_valid():
            # Recoger los datos del formulario
            conexion = Conexion()  # Crear una instancia del modelo Conexion
            conexion.host = form.cleaned_data['host']
            conexion.db_type=form.cleaned_data['db_type']
            conexion.dbname = form.cleaned_data['dbname']
            conexion.user = form.cleaned_data['user']
            conexion.port = form.cleaned_data['port']
            conexion.password    = form.cleaned_data['password']
            conexion.name = " ~ " + form.cleaned_data['name']

            db_url = obtener_conexion(conexion)
            try:
                if form.cleaned_data['db_type'] == "sqlite":
                    if not os.path.exists(conexion.dbname):
                        raise Exception("El archivo de base de datos no existe")

                # Crear la conexión a la base de datos
                engine = create_engine(db_url)
                # Probar la conexión
                with engine.connect() as connection:
                    # Ejecutar una consulta simple
                    result = connection.execute(text("SELECT 1"))
                    print(result.fetchone())
                    result.fetchone()  # Consume el resultado

                # Verificar cuál botón fue presionado
                if request.POST.get('action') == 'save':
                    # Manejo del archivo subido
                    uploaded_file = form.cleaned_data.get('file', None)
                    if uploaded_file is not None:
                        file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', uploaded_file.name)

                        # Verificar si el archivo ya existe y renombrarlo si es necesario
                        if os.path.exists(file_path):
                            base_name, extension = os.path.splitext(uploaded_file.name)
                            while os.path.exists(file_path):
                                new_name = f"{base_name}_{random.randint(1, 10)}{extension}"
                                file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', new_name)

                        # Guarda el archivo en el sistema de archivos
                        with open(file_path, 'wb+') as destination:
                            for chunk in uploaded_file.chunks():
                                destination.write(chunk)

                    # Guardar la conexión en la base de datos
                    conexion.save()  # Guarda la instancia de Conexion

                    return redirect('test_connection')  # Redirige a la misma página o a otra vista que desees

                return render(request, 'test_connection.html', {'success': True, 'form': form})

            except Exception as err:
                if "Duplicate entry" in str(err):
                    error = 'Ya existe una conexión con este nombre'
                else:
                    error = str(err)
                return JsonResponse({'exito': False, 'mensaje': error}, status=400)

    else:
        form = ConexionForm()

    return render(request, 'test_connection.html', {'form': form, 'is_admin': is_admin})


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
