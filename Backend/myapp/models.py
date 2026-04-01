
from django.db import models
from django.contrib.auth.models import User # Importa el modelo User de Django
from django.db.models.signals import post_save
from django.dispatch import receiver
# Create your models here.
# --- Tablas Base e Independientes ---

class Perfil(models.Model):
    # La clave mágica: Un usuario tiene un solo perfil
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    
    # Tus campos personalizados
    boleta = models.CharField(max_length=20, unique=True, null=True, blank=True)
    edad = models.IntegerField(null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=[('M', 'Masculino'), ('F', 'Femenino')], null=True, blank=True)
    
    # Relaciones
    idRol = models.ForeignKey('Roles', on_delete=models.RESTRICT, db_column='idRol', null=True, blank=True)
    idCategoria = models.ForeignKey('Categoria', on_delete=models.SET_NULL, db_column='idCategoria', null=True, blank=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"

# --- AUTOMATIZACIÓN (SIGNALS) ---
# Esto es vital: Cuando se crea un User, se crea automáticamente un Perfil vacío.
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Perfil.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.perfil.save()

class Categoria(models.Model):
    # Django auto-crea 'id' si no se especifica. Usamos el nombre explícito para claridad.
    idCategoria = models.AutoField(primary_key=True) 
    nombreCategoria = models.CharField(max_length=255, unique=True)
    Ranking = models.IntegerField(null=True, blank=True) # Campo añadido con ALTER TABLE

    class Meta:
        db_table = 'categoria'
        verbose_name_plural = "Categorias"

class Roles(models.Model):
    idRol = models.AutoField(primary_key=True)
    nombreRol = models.CharField(max_length=100)

    class Meta:
        db_table = 'roles'
        verbose_name_plural = "Roles"

class Formato(models.Model):
    idFormato = models.AutoField(primary_key=True)
    NombreFormato = models.CharField(max_length=50) 

    class Meta:
        db_table = 'formato'
        verbose_name_plural = "Formatos"

# --- Tablas con Relaciones ---


class Torneo(models.Model):
    idTorneo = models.AutoField(primary_key=True)
    nombreTorneo = models.CharField(max_length=255)
    tipo = models.CharField(max_length=50, null=True, blank=True) 
    rama = models.CharField(max_length=50, null=True, blank=True) 
    numeroGrupos = models.IntegerField(null=True, blank=True)
    tamanoGrupos = models.IntegerField(null=True, blank=True)
    fechaInicio = models.DateField()
    fechaFin = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=50, null=True, blank=True) 
    
    # FKs
    formato_id = models.ForeignKey(Formato, on_delete=models.RESTRICT, db_column='formato_id')
    categoria_id = models.ForeignKey(Categoria, on_delete=models.RESTRICT, db_column='categoria_id')

    class Meta:
        db_table = 'torneo'
        verbose_name_plural = "Torneos"

class Cuadro(models.Model):
    idCuadro = models.AutoField(primary_key=True)
    tamanoCuadro = models.IntegerField() 
    
    # FK (OneToOneField por UNIQUE NOT NULL en SQL)
    torneo_id = models.OneToOneField(Torneo, on_delete=models.RESTRICT, db_column='torneo_id')

    class Meta:
        db_table = 'cuadro'
        verbose_name_plural = "Cuadros"
        
class GruposCategoria(models.Model):
    idgrupoCategoria = models.AutoField(primary_key=True)
    nombreGrupo = models.CharField(max_length=50, unique=True)
    
    # FK
    torneo_id = models.ForeignKey(Torneo, on_delete=models.CASCADE, db_column='torneo_id')

    class Meta:
        db_table = 'gruposCategoria'
        verbose_name_plural = "Grupos Categorias"
        # Para forzar la unicidad compuesta, se puede usar: unique_together = (('nombreGrupo', 'torneo_id'),)

## tabla intermedia que unira a un "User" con un "Torneo". 
class Inscripciones(models.Model):
    #llave primaria original
    idInscripcion = models.AutoField(primary_key=True)
    
    # campo de estado
    estado_inscripcion = models.CharField(max_length=50, default='Pendiente')
    
    # fecha 
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    
    # FK Torneo
    torneo = models.ForeignKey(Torneo, on_delete=models.CASCADE, related_name='inscripciones', db_column='torneo_id')
    
    # FK Jugador
    jugador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inscripciones', db_column='jugador_id')

    class Meta:
        db_table = 'inscripciones'
        verbose_name_plural = "Inscripciones"
        # Evita que el jugador se inscriba 2 veces al MISMO torneo
        unique_together = ('jugador', 'torneo')

    def __str__(self):
        return f"{self.jugador.username} - Torneo ID: {self.torneo_id} ({self.estado_inscripcion})"


class Disponibilidad(models.Model):
    idDisponibilidad = models.AutoField(primary_key=True)
    diaSemana = models.CharField(max_length=10)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    esta_disponible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # FK
    inscripcion_id = models.ForeignKey(Inscripciones, on_delete=models.CASCADE, db_column='inscripcion_id')

    class Meta:
        db_table = 'disponibilidad'
        verbose_name_plural = "Disponibilidades"


class MiembrosGrupo(models.Model):
    idMiembrosGrupo = models.AutoField(primary_key=True)
    
    # FKs (OneToOneField debido a la restricción UNIQUE NOT NULL en SQL)
    grupo_id = models.OneToOneField(GruposCategoria, on_delete=models.CASCADE, db_column='grupo_id')
    inscripcion_id = models.OneToOneField(Inscripciones, on_delete=models.CASCADE, db_column='inscripcion_id')

    class Meta:
        db_table = 'miembrosGrupo'
        verbose_name_plural = "Miembros Grupo"
        # Para hacerlos una clave compuesta: unique_together = (('grupo_id', 'inscripcion_id'),)


class PosicionesGrupo(models.Model):
    idPosicionGrupo = models.AutoField(primary_key=True)
    partidosJugados = models.IntegerField(default=0)
    partidosGanados = models.IntegerField(default=0)
    partidosPerdidos = models.IntegerField(default=0)
    setsFavor = models.IntegerField(default=0)
    setsContra = models.IntegerField(default=0)
    juegosFavor = models.IntegerField(default=0)
    juegosContra = models.IntegerField(default=0)
    puntos = models.IntegerField(default=0)
    
    # FKs (OneToOneField debido a la restricción UNIQUE NOT NULL en SQL)
    Torneo_id = models.OneToOneField(Torneo, on_delete=models.CASCADE, db_column='Torneo_id')
    grupo_id = models.OneToOneField(GruposCategoria, on_delete=models.CASCADE, db_column='grupo_id')
    inscripcion_id = models.OneToOneField(Inscripciones, on_delete=models.CASCADE, db_column='inscripcion_id')

    class Meta:
        db_table = 'PosicionesGrupo'
        verbose_name_plural = "Posiciones Grupo"


class Partido(models.Model):
    
    idPartido = models.AutoField(primary_key=True)
    estado = models.CharField(max_length=50, null=True, blank=True)
    fechaPartido = models.DateField(null=True, blank=True)
    horaPartido = models.TimeField(null=True, blank=True)
    
    # NUEVOS CAMPOS: Solo contamos Sets
    sets_jugador1 = models.IntegerField(default=0, help_text="Sets ganados por jugador 1")
    sets_jugador2 = models.IntegerField(default=0, help_text="Sets ganados por jugador 2")
    
    # FKs
    grupo_id = models.ForeignKey(GruposCategoria, on_delete=models.SET_NULL, db_column='grupo_id', null=True, blank=True)
    ins_a_id = models.ForeignKey(Inscripciones, on_delete=models.RESTRICT, related_name='partidos_j1', db_column='jugador_a_id')
    ins_b_id = models.ForeignKey(Inscripciones, on_delete=models.RESTRICT, related_name='partidos_j2', db_column='jugador_b_id')
    #Ganador puede ser null al inicio
    ganador_ins_id = models.ForeignKey(Inscripciones, on_delete=models.SET_NULL, related_name='partidos_ganados', db_column='Ganador', null=True, blank=True)

    # Estado (para saber si ya se jugó)
    estado = models.CharField(max_length=20, choices=[('Pendiente', 'Pendiente'), ('Finalizado', 'Finalizado')], default='Pendiente')

    def __str__(self):
        return f"{self.jugador1} vs {self.jugador2} - Ganador: {self.ganador}"
    class Meta:
        db_table = 'partido'
        verbose_name_plural = "Partidos"



