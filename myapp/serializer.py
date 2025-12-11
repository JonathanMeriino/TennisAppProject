from rest_framework import serializers
from .models import Categoria

class CategoriaSerializer (serializer.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'
