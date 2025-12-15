from django.shortcuts import render
from rest_framework import viewsets
from .serializer import (CategoriaSerializer, RolesSerializer, FormatoSerializer, UsuarioSerializer, TorneoSerializer, CuadroSerializer, GruposCategoriaSerializer, InscripcionesSerializer, DisponibilidadSerializer, MiembrosGrupoSerializaer, PosicionesGrupoSerializer, PartidoSerializer , SetsSerializer)
from .models import (
    Categoria, Roles, Formato, Usuario, Torneo, Cuadro, GruposCategoria, 
    Inscripciones, Disponibilidad, MiembrosGrupo, PosicionesGrupo, Partido, Sets
)

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
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class TorneoViewSet(viewsets.ModelViewSet):
    queryset = Torneo.objects.all()
    serializer_class = TorneoSerializer

class CuadroViewSet(viewsets.ModelViewSet):
    queryset = Cuadro.objects.all()
    serializer_class = CuadroSerializer

class GruposCategoriaViewSet(viewsets.ModelViewSet):
    queryset = GruposCategoria.objects.all()
    serializer_class = GruposCategoriaSerializer

class InscripcionesViewSet(viewsets.ModelViewSet):
    queryset = Inscripciones.objects.all()
    serializer_class = InscripcionesSerializer

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

class SetsViewSet (viewsets.ModelViewSet):
    queryset = Sets.objects.all()
    serializer_class = SetsSerializer