# forms.py

from django import forms
from .models import Conexion  # Asegúrate de que el modelo Conexion esté en el mismo directorio de la aplicación

class ConexionForm(forms.ModelForm):
    class Meta:
        model = Conexion  # Especificamos el modelo que estamos utilizando
        fields = ['name', 'host', 'db_type', 'port', 'dbname', 'user', 'password']  # Campos del formulario
        widgets = {
            'password': forms.PasswordInput(),  # Usamos PasswordInput para que la contraseña no se muestre en texto plano
        }
        labels = {
            'name': 'Nombre de la Conexión',
            'host': 'Host',
            'db_type': 'db_type',
            'port': 'Puerto',
            'dbname': 'Nombre de la Base de Datos',
            'user': 'User',
            'password': 'Contraseña',
        }
