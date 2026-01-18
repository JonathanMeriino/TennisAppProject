from django.contrib import admin
from .models import (
    Categoria, Roles, Formato, Torneo, Cuadro, GruposCategoria, 
    Inscripciones, Disponibilidad, MiembrosGrupo, PosicionesGrupo, Partido, Sets
)
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Perfil
# Register your models here.

# Definimos el formulario 'en línea'
class PerfilInline(admin.StackedInline):
    model = Perfil
    can_delete = False
    verbose_name_plural = 'Perfil de Jugador'

# Extendemos el UserAdmin original
class UserAdmin(BaseUserAdmin):
    inlines = (PerfilInline,)

# Re-registramos el User con nuestra configuración
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# --- 1. Tablas Base e Independientes ---

# Registro simple de las tablas sin personalización
admin.site.register(Categoria) # Listo
admin.site.register(Roles)
admin.site.register(Formato)

# --- 2. Tablas Principales ---

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