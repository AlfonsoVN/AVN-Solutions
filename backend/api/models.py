# models.py

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password

class Conexion(models.Model):
    name = models.CharField(max_length=255)
    host = models.CharField(max_length=255)
    db_type = models.CharField(max_length=255)
    port = models.IntegerField()
    dbname = models.CharField(max_length=255)
    user = models.CharField(max_length=255)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        if not email:
            raise ValueError("El correo electrónico es obligatorio")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, name, password=None):
        user = self.create_user(email, name, password)
        user.is_admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    role = models.IntegerField(choices=((0, "Usuario"), (1, "Admin")), default=0)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

    def set_password(self, raw_password):
        self.password = make_password(raw_password)
