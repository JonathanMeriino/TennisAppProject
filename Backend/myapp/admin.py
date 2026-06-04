from django.contrib import admin
from .models import (
    Perfil, Roles, Torneo, Inscripcion, Partido, Resultado
)

from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
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

admin.site.register(Roles)


# --- 2. Tablas Principales ---

admin.site.register(Torneo)


# --- 3. Tablas de Relación y Movimiento ---

admin.site.register(Inscripcion)

admin.site.register(Partido)
admin.site.register(Resultado)
