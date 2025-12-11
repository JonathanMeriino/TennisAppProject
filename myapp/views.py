from django.shortcuts import render
from rest_framework import viewsets
from .serializer import CategoriaSerializer
from .models import Categoria

# Create your views here.

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer