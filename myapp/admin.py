from django.contrib import admin
from .models import (
    Categoria, Roles, Formato, Usuario, Torneo, Cuadro, GruposCategoria, 
    Inscripciones, Disponibilidad, MiembrosGrupo, PosicionesGrupo, Partido, Sets
)
# Register your models here.

# --- 1. Tablas Base e Independientes ---

# Registro simple de las tablas sin personalización
admin.site.register(Categoria)
admin.site.register(Roles)
admin.site.register(Formato)

# --- 2. Tablas Principales ---

admin.site.register(Usuario)
admin.site.register(Torneo)
admin.site.register(Cuadro)
admin.site.register(GruposCategoria)

# --- 3. Tablas de Relación y Movimiento ---

admin.site.register(Inscripciones)
admin.site.register(Disponibilidad)
admin.site.register(MiembrosGrupo)
admin.site.register(PosicionesGrupo)
admin.site.register(Partido)
admin.site.register(Sets)