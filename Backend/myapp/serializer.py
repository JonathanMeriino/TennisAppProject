from rest_framework import serializers
from .models import (
    Categoria, Roles, Formato, Usuario, Torneo, Cuadro, GruposCategoria, 
    Inscripciones, Disponibilidad, MiembrosGrupo, PosicionesGrupo, Partido, Sets
)

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
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

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
    
