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

#Serializer Roles
class RolesSerializer (serializers.ModelSerializer):
    class Meta:
        model = Roles 
        fields = '__all__'


# --- SERIALIZERS DE USUARIO Y PERFIL ---

class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        # Ajustado a los nombres limpios del modelo refactorizado, soportando ambos por compatibilidad
        fields = ['boleta', 'edad', 'sexo', 'rol', 'escuela', 'categoria']

class UserSerializer(serializers.ModelSerializer):
    perfil = PerfilSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'perfil']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }

    def validate(self, data):
        email = data.get('email')

        if email:
            if self.instance:
                if User.objects.filter(email=email).exclude(pk=self.instance.pk).exists():
                    raise serializers.ValidationError({"email": "Este correo ya está registrado por otro usuario."})
            else:
                if User.objects.filter(email=email).exists():
                    raise serializers.ValidationError({"email": "Este correo ya está registrado."})

        # Validar boleta en el perfil
        perfil_data = data.get('perfil', {})
        boleta = perfil_data.get('boleta') or perfil_data.get('boleta_usuario')
        if boleta:
            query = Perfil.objects.filter(boleta=boleta)
            if self.instance:
                query = query.exclude(user=self.instance)
            if query.exists():
                raise serializers.ValidationError({"boleta": "Esta boleta ya está registrada."})
                
        return data

    def create(self, validated_data):
        perfil_data = validated_data.pop('perfil', {})
        password = validated_data.pop('password', None)
        
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()

        perfil, _ = Perfil.objects.get_or_create(user=user)
        
        # Mapeo unificado compatible con los nombres nuevos y antiguos
        perfil.boleta = perfil_data.get('boleta') or perfil_data.get('boleta_usuario', perfil.boleta)
        perfil.edad = perfil_data.get('edad') or perfil_data.get('edad_usuario', perfil.edad)
        perfil.escuela = perfil_data.get('escuela') or perfil_data.get('escuela_usuario', perfil.escuela)
        perfil.sexo = perfil_data.get('sexo') or perfil_data.get('sexo_usuario', perfil.sexo)
        
        if 'rol' in perfil_data and perfil_data['rol']:
            perfil.rol_id = perfil_data['rol']
        if 'categoria' in perfil_data and perfil_data['categoria']:
            perfil.categoria_id = perfil_data['categoria']
            
        perfil.save()
        return user
    
    def update(self, instance, validated_data):
        perfil_data = validated_data.pop('perfil', {})
        
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        perfil, _ = Perfil.objects.get_or_create(user=instance)

        if perfil_data:
            perfil.boleta = perfil_data.get('boleta') or perfil_data.get('boleta_usuario', perfil.boleta)
            perfil.edad = perfil_data.get('edad') or perfil_data.get('edad_usuario', perfil.edad)
            perfil.sexo = perfil_data.get('sexo') or perfil_data.get('sexo_usuario', perfil.sexo)
            perfil.escuela = perfil_data.get('escuela') or perfil_data.get('escuela_usuario', perfil.escuela)

            es_admin = instance.is_staff or instance.is_superuser or (hasattr(instance, 'perfil') and instance.perfil.rol and instance.perfil.rol.nombre_rol == 'Administrador')
            
            if es_admin:
                nueva_escuela = perfil_data.get('escuela') or perfil_data.get('escuela_usuario')
                if nueva_escuela:
                    perfil.escuela = nueva_escuela
            if 'rol' in perfil_data:
                perfil.rol_id = perfil_data.get('rol')
            if 'categoria' in perfil_data:
                perfil.categoria_id = perfil_data.get('categoria')
                
            perfil.save()
            
        return instance


#Serializer Inscripciones
class InscripcionesSerializer(serializers.ModelSerializer):
    nombre_jugador = serializers.CharField(source='jugador.username', read_only=True)
    nombre_torneo = serializers.CharField(source='torneo.nombre_torneo', read_only=True)
    categoria_jugador = serializers.CharField(
        source='jugador.perfil.categoria.nombre_categoria', 
        read_only=True, 
        default='Sin categoría'
    )

    class Meta:
        model = Inscripcion
        fields = '__all__'
        read_only_fields = ['fecha_inscripcion']

    def validate(self, data):
        if self.instance is not None:
            return data

        jugador = data.get('jugador')
        torneo = data.get('torneo')

        if not hasattr(jugador, 'perfil'):
            raise serializers.ValidationError({
                "jugador": "Debes completar tu perfil antes de inscribirte."
            })

        perfil = jugador.perfil

        # Validación de Rama (Sexo) - Ajustada al campo 'sexo' del modelo refactorizado
        if torneo.rama_torneo == 'Varonil' and perfil.sexo != 'M':
            raise serializers.ValidationError({"rama": "Inscripción rechazada. El torneo está restringido a la rama Varonil."})
        elif torneo.rama_torneo == 'Femenil' and perfil.sexo != 'F':
            raise serializers.ValidationError({"rama": "Inscripción rechazada. El torneo está restringido a la rama Femenil."})

        # Validación de Categoría Relacional
        if torneo.categoria != perfil.categoria:
            raise serializers.ValidationError({
                "categoria": f"El nivel del torneo es '{torneo.categoria.nombre_categoria}', pero tu perfil es '{perfil.categoria.nombre_categoria if perfil.categoria else 'Sin Categoría'}'."
            })

        return data


class ResultadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resultado
        fields = '__all__'


#Serializer Partido
class PartidoSerializer(serializers.ModelSerializer):
    username_j1 = serializers.CharField(source='jugador1.jugador.username', read_only=True)
    siembra_j1 = serializers.IntegerField(source='jugador1.numero_siembra', read_only=True)

    username_j2 = serializers.CharField(source='jugador2.jugador.username', read_only=True)
    siembra_j2 = serializers.IntegerField(source='jugador2.numero_siembra', read_only=True)

    resultado = ResultadoSerializer(read_only=True)
    # Corregida la ruta de source para apuntar correctamente al username del ganador a través de la inscripción
    username_ganador = serializers.CharField(source='ganador.jugador.username', read_only=True, allow_null=True)
    
    class Meta:
        model = Partido
        fields = '__all__'
