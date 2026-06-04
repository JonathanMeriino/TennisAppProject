from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# --- Tablas Base e Independientes ---

class Roles(models.Model):
    idRol = models.AutoField(primary_key=True)
    nombreRol = models.CharField(max_length=100)

    class Meta:
        db_table = 'roles'
        verbose_name_plural = "Roles"
        
    def __str__(self):
        return self.nombreRol


class Perfil(models.Model):
    # Un usuario tiene un solo perfil
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    
    # Tus campos personalizados
    boleta = models.CharField(max_length=20, unique=True, null=True, blank=True)
    edad = models.IntegerField(null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=[('M', 'Masculino'), ('F', 'Femenino')], null=True, blank=True)
    
    # Categoría ahora es un campo de texto directo, ya no es una tabla extra
    categoria = models.CharField(max_length=50, null=True, blank=True, help_text="Ej: Principiante, A, B, C")
    
    # Relaciones
    idRol = models.ForeignKey(Roles, on_delete=models.RESTRICT, db_column='idRol', null=True, blank=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"

# --- AUTOMATIZACIÓN (SIGNALS) ---
# Cuando se crea un User, se crea automáticamente un Perfil vacío.
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Perfil.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.perfil.save()


# 1. TORNEO (Basado en el ERD)
class Torneo(models.Model):
    id_torneo = models.AutoField(primary_key=True)
    nombre_torneo = models.CharField(max_length=150)
    rama_torneo = models.CharField(max_length=50) # Varonil, Femenil, Mixto
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    categoria_torneo = models.CharField(max_length=50)
    estado_torneo = models.CharField(max_length=50, default='Programado')

    def __str__(self):
        return self.nombre_torneo

# 2. INSCRIPCION (Basado en el ERD)
class Inscripcion(models.Model):
    id_inscripcion = models.AutoField(primary_key=True)
    torneo = models.ForeignKey(Torneo, on_delete=models.CASCADE, related_name='inscripciones')
    jugador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inscripciones')
    
    numero_siembra = models.PositiveIntegerField(null=True, blank=True)
    matriz_disponibilidad = models.JSONField(null=True, blank=True) # JSON para guardar horarios
    estado_inscripcion = models.CharField(max_length=50, default='Pendiente')
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inscripcion'
        unique_together = ('jugador', 'torneo') # Regla anti-duplicados

    def __str__(self):
        return f"Inscripción: {self.jugador.username} en {self.torneo.nombre_torneo}"

# 3. PARTIDO (Basado en el ERD + Lógica de Llaves)
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

    def __str__(self):
        j1 = self.jugador1.jugador.username if self.jugador1 else "Por definir"
        j2 = self.jugador2.jugador.username if self.jugador2 else "Por definir"
        return f"{self.fase}: {j1} vs {j2}"

# 4. RESULTADO (Nueva tabla basada en el ERD)
class Resultado(models.Model):
    id_resultado = models.AutoField(primary_key=True)
    partido = models.OneToOneField(Partido, on_delete=models.CASCADE, related_name='resultado')
    
    sets_jugador1 = models.PositiveIntegerField(default=0)
    sets_jugador2 = models.PositiveIntegerField(default=0)
    
    ganador = models.ForeignKey(Inscripcion, on_delete=models.SET_NULL, null=True, blank=True, related_name='partidos_ganados')

    def __str__(self):
        return f"Resultado del Partido {self.partido.id_partido}"