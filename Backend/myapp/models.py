from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# ==========================================
# 1. TABLAS DE CATÁLOGOS E INDEPENDIENTES
# ==========================================

class Roles(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=100)

    class Meta:
        db_table = 'roles'
        verbose_name_plural = "Roles"
        
    def __str__(self):
        return self.nombre_rol

class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre_categoria = models.CharField(max_length=50, unique=True, help_text="Ej: Principiante, A, B, C")

    class Meta:
        db_table = 'categoria'
        verbose_name_plural = "Categorias"

    def __str__(self):
        return self.nombre_categoria

# ==========================================
# 2. PERFIL DEL USUARIO
# ==========================================

class Perfil(models.Model):
    # Relación OneToOne con la tabla nativa User de Django (para correo y password)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    
    # Campos propios del negocio
    boleta_usuario = models.CharField(max_length=20, unique=True, null=True, blank=True)
    edad_usuario = models.IntegerField(null=True, blank=True)
    sexo_usuario = models.CharField(max_length=1, choices=[('M', 'Masculino'), ('F', 'Femenino')], null=True, blank=True)
    
    # Llaves foráneas (Django automáticamente les agregará "_id" en la base de datos)
    rol = models.ForeignKey(Roles, on_delete=models.RESTRICT, null=True, blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='perfiles')

    def __str__(self):
        return f"Perfil de {self.user.username}"

# --- AUTOMATIZACIÓN (SIGNALS) ---
# Cuando se crea un User en el sistema de Django, se crea automáticamente su Perfil.
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Perfil.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.perfil.save()


# ==========================================
# 3. CORE DEL TORNEO (ELIMINACIÓN DIRECTA)
# ==========================================

class Torneo(models.Model):
    id_torneo = models.AutoField(primary_key=True)
    nombre_torneo = models.CharField(max_length=150)
    rama_torneo = models.CharField(max_length=50) # Ej: Varonil, Femenil, Mixto
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado_torneo = models.CharField(max_length=50, default='Programado')
    
    # Relación con la tabla Categoria
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='torneos')

    def __str__(self):
        return self.nombre_torneo

class Inscripcion(models.Model):
    id_inscripcion = models.AutoField(primary_key=True)
    
    torneo = models.ForeignKey(Torneo, on_delete=models.CASCADE, related_name='inscripciones')
    jugador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inscripciones')
    
    # Campos estratégicos para la Eliminación Directa
    numero_siembra = models.PositiveIntegerField(null=True, blank=True)
    matriz_disponibilidad = models.JSONField(null=True, blank=True) 
    estado_inscripcion = models.CharField(max_length=50, default='Pendiente')
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inscripcion'
        unique_together = ('jugador', 'torneo') # Regla anti-duplicados

    def __str__(self):
        return f"Inscripción: {self.jugador.username} en {self.torneo.nombre_torneo}"

class Partido(models.Model):
    id_partido = models.AutoField(primary_key=True)
    torneo = models.ForeignKey(Torneo, on_delete=models.CASCADE, related_name='partidos')
    
    # IMPORTANTE: Apuntan a Inscripcion permitiendo nulos para las llaves vacías futuras
    jugador1 = models.ForeignKey(Inscripcion, related_name='partidos_como_j1', on_delete=models.SET_NULL, null=True, blank=True)
    jugador2 = models.ForeignKey(Inscripcion, related_name='partidos_como_j2', on_delete=models.SET_NULL, null=True, blank=True)
    
    estado = models.CharField(max_length=50, default='Pendiente')
    fecha = models.DateField(null=True, blank=True)
    hora = models.TimeField(null=True, blank=True)

    # Campos esenciales para armar el cuadro de avance automático (Bracket)
    fase = models.CharField(max_length=50, default='Primera Ronda') 
    partido_siguiente = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='partidos_previos')

    def __str__(self):
        j1 = self.jugador1.jugador.username if self.jugador1 else "Por definir"
        j2 = self.jugador2.jugador.username if self.jugador2 else "Por definir"
        return f"{self.fase}: {j1} vs {j2}"

class Resultado(models.Model):
    id_resultado = models.AutoField(primary_key=True)
    
    # OneToOneField porque un partido solo tiene UN resultado oficial
    partido = models.OneToOneField(Partido, on_delete=models.CASCADE, related_name='resultado')
    
    sets_jugador1 = models.PositiveIntegerField(default=0)
    sets_jugador2 = models.PositiveIntegerField(default=0)
    
    # El ganador apunta directamente a la Inscripcion
    ganador = models.ForeignKey(Inscripcion, on_delete=models.SET_NULL, null=True, blank=True, related_name='partidos_ganados')

    def __str__(self):
        return f"Resultado del Partido {self.partido.id_partido}"