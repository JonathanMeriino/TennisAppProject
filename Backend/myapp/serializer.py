from rest_framework import serializers
from .models import (
    Categoria, Perfil, Roles, Torneo, Inscripcion, Partido, Resultado
)
from django.contrib.auth.models import User

#Serializer Categoria
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'
#Serializer Torneo
class TorneoSerializer(serializers.ModelSerializer):
    nombre_categoria = serializers.CharField(source='categoria.nombre_categoria', read_only=True)

    class Meta:
        model = Torneo
        fields = '__all__'

#Serializaer Roles
class RolesSerializer (serializers.ModelSerializer):
    class Meta:
        model = Roles 
        fields = '__all__'



#Serializer Usuario

class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = ['boleta_usuario', 'edad_usuario', 'sexo_usuario', 'rol', 'categoria']

class UserSerializer(serializers.ModelSerializer):
    # Incrustamos el perfil aquí
    perfil = PerfilSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email','password', 'first_name', 'last_name', 'perfil']
        # Añadimos esta linea para que la contraseña sea segura y no viaje de regreso
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }
    #Validar si el correo existe antes de crear
    def validate(self, data):
        # Validar si el email ya existe en la base de datos
        email = data.get('email')

        if self.instance:  # Si estamos actualizando un usuario existente
            if User.objects.filter(email=email).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError({"email": "Este correo ya está registrado por otro usuario."})
            else:  # registro nuevo
                if User.objects.filter(email=email).exists():
                    raise serializers.ValidationError({"email": "Este correo ya está registrado."})


        # Validar si la boleta ya existe en la tabla de Perfil (excluyendo al usuario actual si aplica)
        perfil_data = data.get('perfil', {})
        boleta_usuario = perfil_data.get('boleta_usuario')
        if boleta_usuario:
            query = Perfil.objects.filter(boleta_usuario=boleta_usuario)
            if self.instance:
                query = query.exclude(user=self.instance)
            if query.exists():
                raise serializers.ValidationError({"boleta_usuario": "Esta boleta ya está registrada."})
                
        return data

    # Sobreescribimos create para guardar ambas tablas al mismo tiempo
    def create(self, validated_data):
        #Extraemos los datos del perfil si vienen en el request
        perfil_data = validated_data.pop('perfil') 
        password = validated_data.pop('password') 
        #Creamos el usuario base
        user = User.objects.create_user(password=password, **validated_data)
        
        # Actualizamos el perfil que se creó automáticamente por la Signal
        Perfil.objects.update_or_create(
            user=user,
            defaults={
                'boleta_usuario': perfil_data.get('boleta_usuario'),
                'edad_usuario': perfil_data.get('edad_usuario'),
                'sexo_usuario': perfil_data.get('sexo_usuario'),
                'categoria': perfil_data.get('categoria'),
                'rol': perfil_data.get('rol', 1)
            }
        )
        
        return user
    def update(self, instance, validated_data):
        perfil_data = validated_data.pop('perfil', {})
        
       
        # Actualizamos los datos basicos del usuario
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        
        instance.save()

        # Actualizacion del perfil asociado
        if perfil_data:
            Perfil.objects.update_or_create(
                user=instance,
                defaults={
                    'boleta_usuario': perfil_data.get('boleta_usuario', getattr(instance, 'perfil', None) and instance.perfil.boleta_usuario),
                    'edad_usuario': perfil_data.get('edad_usuario', getattr(instance, 'perfil', None) and instance.perfil.edad_usuario),
                    'sexo_usuario': perfil_data.get('sexo_usuario', getattr(instance, 'perfil', None) and instance.perfil.sexo_usuario),
                    'categoria': perfil_data.get('categoria', getattr(instance, 'perfil', None) and instance.perfil.categoria),
                }
            )
            
        return instance



#Serializer Inscripciones
class InscripcionesSerializer(serializers.ModelSerializer):
    nombre_jugador = serializers.CharField(source='jugador.username', read_only=True)
    nombre_torneo = serializers.CharField(source='torneo.nombre', read_only=True)

    class Meta:
        model = Inscripcion
        fields = '__all__'
        read_only_fields = ['fecha_inscripcion']

    def validate(self, data):
        # Si la instancia ya existe, significa que es una actualización (como guardar la siembra), 
        # por lo que saltamos esta validación de perfil.
        if self.instance is not None:
            return data

        jugador = data.get('jugador')
        torneo = data.get('torneo')

        # 1. Validar que el perfil exista
        if not hasattr(jugador, 'perfil'):
            raise serializers.ValidationError({
                "jugador": "Debes completar tu perfil (sexo, categoría, etc.) antes de inscribirte."
            })

        perfil = jugador.perfil

        # Validación de Rama (Sexo)
        if torneo.rama_torneo == 'Varonil' and perfil.sexo_usuario != 'M':
            raise serializers.ValidationError({"rama": "Inscripción rechazada. El torneo está restringido a la rama Varonil."})
        elif torneo.rama_torneo == 'Femenil' and perfil.sexo_usuario != 'F':
            raise serializers.ValidationError({"rama": "Inscripción rechazada. El torneo está restringido a la rama Femenil."})

        # Validación de Categoría Relacional
        if torneo.categoria != perfil.categoria:
            raise serializers.ValidationError({
                "categoria": f"El nivel del torneo es '{torneo.categoria.nombre_categoria}', pero tu perfil es '{perfil.categoria.nombre_categoria if perfil.categoria else 'Sin Categoría'}'."
            })

        return data

#Serializer Partido
class PartidoSerializer(serializers.ModelSerializer):
    username_j1 = serializers.CharField(source='jugador1.jugador.username', read_only=True)
    username_j2 = serializers.CharField(source='jugador2.jugador.username', read_only=True)

    class Meta:
        model = Partido
        fields = '__all__'

class ResultadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resultado
        fields = '__all__'

    
