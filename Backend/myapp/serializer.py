from rest_framework import serializers
from .models import (
    Categoria, Roles, Formato, Perfil,Torneo, Cuadro, GruposCategoria, 
    Inscripciones, Disponibilidad, MiembrosGrupo, PosicionesGrupo, Partido
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
    # Campos de "Solo Lectura" para que el Frontend muestre texto, no solo IDs
    nombre_jugador = serializers.CharField(source='jugador.username', read_only=True)
    nombre_torneo = serializers.CharField(source='torneo.nombre', read_only=True)

    class Meta:
        model = Inscripciones
        # listamos los campos explícitamente para incluir los nuevos
        fields = [
            'idInscripcion', 
            'jugador', 'nombre_jugador', 
            'torneo', 'nombre_torneo', 
            'estado_inscripcion', 
            'fecha_inscripcion'
        ]
        # Evitamos que el usuario edite estos campos al hacer un POST/PUT
        read_only_fields = ['estado_inscripcion', 'fecha_inscripcion']

    # REGLAS DE NEGOCIO:
    def validate(self, data):
        jugador = data.get('jugador')
        torneo = data.get('torneo')

        # 1. Validar que el perfil exista
        if not hasattr(jugador, 'perfil'):
            raise serializers.ValidationError({
                "jugador": "Debes completar tu perfil (sexo, categoría, etc.) antes de inscribirte."
            })

        perfil = jugador.perfil

        # --- REGLA 2: VALIDACIÓN DE RAMA (SEXO) ---
        # Asumimos que perfil.sexo guarda 'Masculino' o 'Femenino'
        # Asumimos que torneo.rama guarda 'Varonil', 'Femenil' o 'Mixto'
        
        rama_torneo = torneo.rama  
        sexo_jugador = perfil.sexo

        if rama_torneo == 'Varonil' and sexo_jugador != 'Masculino':
            raise serializers.ValidationError({
                "rama": "No puedes inscribirte. Este torneo es exclusivo para la rama Varonil."
            })
            
        elif rama_torneo == 'Femenil' and sexo_jugador != 'Femenino':
            raise serializers.ValidationError({
                "rama": "No puedes inscribirte. Este torneo es exclusivo para la rama Femenil."
            })
        # Si es 'Mixto', pasa directo sin importar el sexo.


        # --- REGLA 3: VALIDACIÓN DE CATEGORÍA (NIVEL) ---
        # Asumimos que tanto el torneo como el perfil tienen un campo 'categoria' (ej. 'A', 'B', 'Principiante')
        
        categoria_torneo = Categoria.nombreCategoria
        categoria_jugador = Categoria.nombreCategoria

        # Evita que un Principiante entre a la categoría 'A' o viceversa
        if categoria_torneo != categoria_jugador:
            raise serializers.ValidationError({
                "categoria": f"Inscripción rechazada. El torneo es categoría '{categoria_torneo}', pero tu perfil es '{categoria_jugador}'."
            })

        return data
    
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


    
