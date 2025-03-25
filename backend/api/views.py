# views.py

from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Conexion  # Asegúrate de tener este modelo definido
from .serializers import ConexionSerializer
from .utils import obtener_conexion, probar_conexion  # Importa las funciones desde utils

@api_view(['POST'])
def comprobar_conexion(request):
    # Usamos el serializer para validar los datos recibidos
    serializer = ConexionSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Obtener los datos de la conexión desde el serializer
            connection_data = serializer.validated_data
            # Crear la URL de la base de datos
            db_url = obtener_conexion(connection_data)
            
            # Probar la conexión a la base de datos
            if probar_conexion(db_url):
                return Response({'exito': True}, status=status.HTTP_200_OK)
            else:
                return Response({'exito': False, 'error': 'Error al conectar'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'exito': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response({'exito': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


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
