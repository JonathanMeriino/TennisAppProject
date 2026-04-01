from django.shortcuts import render
from rest_framework import permissions
from rest_framework import viewsets
from .serializer import (CategoriaSerializer, RolesSerializer, FormatoSerializer, UserSerializer, TorneoSerializer, CuadroSerializer, GruposCategoriaSerializer, InscripcionesSerializer, DisponibilidadSerializer, MiembrosGrupoSerializaer, PosicionesGrupoSerializer, PartidoSerializer )
from .models import (
    Categoria, Roles, Formato, User, Torneo, Cuadro, GruposCategoria, 
    Inscripciones, Disponibilidad, MiembrosGrupo, PosicionesGrupo, Partido
)
from .permissions import IsAdminUserCustom

# Create your views here.

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class RolesViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolesSerializer
    
class FormatoViewSet(viewsets.ModelViewSet):
    queryset = Formato.objects.all()
    serializer_class = FormatoSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TorneoViewSet(viewsets.ModelViewSet):
    queryset = Torneo.objects.all()
    serializer_class = TorneoSerializer
    def get_permissions(self):
        # Si alguien quiere borrar (DELETE), editar (PUT/PATCH) o crear (POST)
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUserCustom]
        else:
            # Si solo quieren ver (LIST, RETRIEVE)
            permission_classes = [permissions.IsAuthenticated] # O AllowAny si es público
            
        return [permission() for permission in permission_classes]

class CuadroViewSet(viewsets.ModelViewSet):
    queryset = Cuadro.objects.all()
    serializer_class = CuadroSerializer

class GruposCategoriaViewSet(viewsets.ModelViewSet):
    queryset = GruposCategoria.objects.all()
    serializer_class = GruposCategoriaSerializer

class InscripcionesViewSet(viewsets.ModelViewSet):
    # Le decimos qué serializador usar
    serializer_class = InscripcionesSerializer
    
    # Solo usuarios logueados pueden entrar aquí
    permission_classes = [permissions.IsAuthenticated]

    # ¿Qué lista de inscripciones devolvemos al hacer un GET?
    def get_queryset(self):
        user = self.request.user
        
        # Si es el Superusuario o un Administrador
        if user.is_superuser or (hasattr(user, 'perfil') and user.perfil.idRol and user.perfil.idRol.nombreRol == 'Administrador'):
            # Devuelve TODAS las inscripciones de todos los torneos
            return Inscripciones.objects.all()
        
        # Si es un jugador normal, SOLO le devolvemos las suyas
        return Inscripciones.objects.filter(jugador=user)

class DisponibilidadViweSet(viewsets.ModelViewSet):
    queryset = Disponibilidad.objects.all()
    serializer_class = DisponibilidadSerializer


class MiembrosGrupoViewSet(viewsets.ModelViewSet):
    queryset = MiembrosGrupo.objects.all()
    serializer_class = MiembrosGrupoSerializaer

class PosicionesGrupoViewSet(viewsets.ModelViewSet):
    queryset = PosicionesGrupo.objects.all()
    serializer_class = PosicionesGrupoSerializer

class PartidoViewSet(viewsets.ModelViewSet):
    queryset = Partido.objects.all()
    serializer_class = PartidoSerializer

