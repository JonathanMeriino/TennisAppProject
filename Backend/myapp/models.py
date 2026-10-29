from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Roles(models.Model):
    # Nota: Django crea 'id' automáticamente. Usar 'id_rol' es redundante pero válido.
    id_rol = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=100)

    class Meta:
        db_table = 'roles'
        verbose_name = "Rol"
        verbose_name_plural = "Roles"
        
    def __str__(self):
        return self.nombre_rol


class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre_categoria = models.CharField(max_length=50, unique=True, help_text="Ej: Principiante, A, B, C")

    class Meta:
        db_table = 'categoria'
        verbose_name = "Categoría"
        verbose_name_plural = "Categorias"

    def __str__(self):
        return self.nombre_categoria


class Perfil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    
    # Nombres simplificados
    boleta = models.CharField(max_length=10, unique=True, null=True, blank=True)
    edad = models.IntegerField(null=True, blank=True)
    
    class Sexo(models.TextChoices):
        MASCULINO = 'M', 'Masculino'
        FEMENINO = 'F', 'Femenino'
    
    sexo = models.CharField(max_length=1, choices=Sexo.choices, null=True, blank=True)
    escuela = models.CharField(max_length=150, null=True, blank=True)
    
    rol = models.ForeignKey(Roles, on_delete=models.RESTRICT, null=True, blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='perfiles')

    def __str__(self):
        return f"Perfil de {self.user.username}"


class Torneo(models.Model):
    # Enums modernos integrados al modelo
    class Rama(models.TextChoices):
        VARONIL = 'Varonil', 'Varonil'
        FEMENIL = 'Femenil', 'Femenil'
        MIXTO = 'Mixto', 'Mixto'

    class Estado(models.TextChoices):
        PROGRAMADO = 'Programado', 'Programado'
        EN_CURSO = 'En Curso', 'En Curso'
        FINALIZADO = 'Finalizado', 'Finalizado'

    id_torneo = models.AutoField(primary_key=True)
    nombre_torneo = models.CharField(max_length=150)
    fecha_inicio = models.DateField()
    rama_torneo = models.CharField(max_length=50, choices=Rama.choices, default=Rama.VARONIL) 
    canchas_disponibles = models.PositiveIntegerField(help_text="Número de canchas habilitadas para este torneo")
    estado_torneo = models.CharField(max_length=50, choices=Estado.choices, default=Estado.PROGRAMADO)
    descripcion_torneo = models.TextField(null=True, blank=True, help_text="Detalles adicionales del torneo")
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='torneos')

    def __str__(self):
        return self.nombre_torneo


class Inscripcion(models.Model):
    id_inscripcion = models.AutoField(primary_key=True)
    torneo = models.ForeignKey(Torneo, on_delete=models.CASCADE, related_name='inscripciones')
    jugador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inscripciones')
    numero_siembra = models.PositiveIntegerField(null=True, blank=True)
    matriz_disponibilidad = models.JSONField(null=True, blank=True) 
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inscripcion'
        unique_together = ('jugador', 'torneo')

    def __str__(self):
        return f"Inscripción: {self.jugador.username} en {self.torneo.nombre_torneo}"


class Partido(models.Model):
    id_partido = models.AutoField(primary_key=True)
    torneo = models.ForeignKey(Torneo, on_delete=models.CASCADE, related_name='partidos')
    
    jugador1 = models.ForeignKey(Inscripcion, related_name='partidos_como_j1', on_delete=models.SET_NULL, null=True, blank=True)
    jugador2 = models.ForeignKey(Inscripcion, related_name='partidos_como_j2', on_delete=models.SET_NULL, null=True, blank=True)
    
    estado = models.CharField(max_length=50, default='Pendiente')
    fecha = models.DateField(null=True, blank=True)
    hora = models.TimeField(null=True, blank=True)

    fase = models.CharField(max_length=50, default='Primera Ronda') 
    partido_siguiente = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='partidos_previos')

    # PROPIEDAD AÑADIDA: Permite leer el ganador desde el serializer o las vistas sin error
    @property
    def ganador(self):
        if hasattr(self, 'resultado') and self.resultado:
            return self.resultado.ganador
        return None

    def __str__(self):
        j1 = self.jugador1.jugador.username if self.jugador1 else "Por definir"
        j2 = self.jugador2.jugador.username if self.jugador2 else "Por definir"
        return f"{self.fase}: {j1} vs {j2}"


class Resultado(models.Model):
    id_resultado = models.AutoField(primary_key=True)
    partido = models.OneToOneField(Partido, on_delete=models.CASCADE, related_name='resultado')
    set1_jugador1 = models.PositiveIntegerField(default=0)
    set1_jugador2 = models.PositiveIntegerField(default=0)
    set2_jugador1 = models.PositiveIntegerField(default=0)
    set2_jugador2 = models.PositiveIntegerField(default=0)
    set3_jugador1 = models.PositiveIntegerField(default=0)
    set3_jugador2 = models.PositiveIntegerField(default=0)
    ganador = models.ForeignKey(Inscripcion, on_delete=models.SET_NULL, null=True, blank=True, related_name='partidos_ganados')

    def __str__(self):
        return f"Resultado del Partido {self.partido.id_partido}"


# --- AUTOMATIZACIÓN (SIGNALS) ---
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Perfil.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.perfil.save()