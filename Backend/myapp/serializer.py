from rest_framework import serializers
from .models import (
    Categoria, Roles, Formato, Perfil,Torneo, Cuadro, GruposCategoria, 
    Inscripciones, Disponibilidad, MiembrosGrupo, PosicionesGrupo, Partido, Sets
)
from django.contrib.auth.models import User


# Serializar categoria
class CategoriaSerializer (serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

#Serializaer Roles
class RolesSerializer (serializers.ModelSerializer):
    class Meta:
        model = Roles 
        fields = '__all__'

#Serializer formato
class FormatoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formato
        fields = '__all__'

#Serializer Usuario

class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = ['boleta', 'edad', 'sexo', 'idRol', 'idCategoria']

class UserSerializer(serializers.ModelSerializer):
    # Incrustamos el perfil aquí
    perfil = PerfilSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'perfil']

    # Sobreescribimos create para guardar ambas tablas al mismo tiempo
    def create(self, validated_data):
        perfil_data = validated_data.pop('perfil') # Sacamos los datos del perfil
        user = User.objects.create_user(**validated_data) # Creamos el User estándar
        
        # Actualizamos el perfil que se creó automáticamente por la Signal
        for attr, value in perfil_data.items():
            setattr(user.perfil, attr, value)
        user.perfil.save()
        
        return user

#Serializer Torneo

class TorneoSerializer (serializers.ModelSerializer):
    class Meta:
        model = Torneo
        fields = '__all__'

#Serializer Cuadro
class CuadroSerializer (serializers.ModelSerializer):
    class Meta:
        model = Cuadro 
        fields = '__all__'

#Serializer GruposCategoria
class GruposCategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = GruposCategoria
        fields = '__all__'

#Serializer Inscripciones
class InscripcionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inscripciones
        fields = '__all__'

#Serializer disponibilidad
class DisponibilidadSerializer (serializers.ModelSerializer):
    class Meta:
        model = Disponibilidad
        fields = '__all__'

#Serializer MiembrosGrupo
class MiembrosGrupoSerializaer(serializers.ModelSerializer):
    class Meta:
        model = MiembrosGrupo
        fields = '__all__'
#Serializer PosicionesGrupo

class PosicionesGrupoSerializer (serializers.ModelSerializer):
    class Meta:
        model = PosicionesGrupo
        fields = '__all__'

#Serializer Partido

class PartidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partido
        fields = '__all__'

class SetsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sets
        fields = '__all__'
    
