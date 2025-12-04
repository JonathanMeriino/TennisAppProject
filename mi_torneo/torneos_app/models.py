from django.db import models

# Create your models here.
# Tabla Roles 
# torneos_app/models.py
from django.db import models

# --- Tablas Base e Independientes ---

class Roles(models.Model):
    idRol = models.AutoField(primary_key=True)
    nombreRol = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'roles'
        verbose_name_plural = "Roles"

""" class Escuela(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = 'escuela'
 """
class Categoria(models.Model):
    idCategoria = models.AutoField(primary_key=True)
    Nombre = models.CharField(max_length=100, unique=True)
    ranking = models.IntegerField(null=True, blank=True)
    class Meta:
        db_table = 'categoria'

class Formato(models.Model):
    idFormato = models.AutoField(primary_key=True)
    TipoFormato = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'formato'
        
# --- Tablas Principales con FKs ---

class Usuario(models.Model):
    idUsuario = models.AutoField(primary_key=True)
    Nombre = models.CharField(max_length=255)
    Edad = models.IntegerField(null=True, blank=True)
    Sexo = models.CharField(max_length=1, choices=[('M', 'Masculino'), ('F', 'Femenino')], null=True, blank=True)
    Boleta = models.CharField(max_length=255, unique=True, null=True) # Se usa CharField para evitar errores si incluye letras
    Correo = models.CharField(max_length=255, unique=True)
    Contraseña = models.CharField(max_length=255)
    Hash = models.CharField(max_length=255, null=True, blank=True)
    
    # FKs
    idRol = models.ForeignKey(Roles, on_delete=models.RESTRICT, db_column='idRol')
    idCategoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, db_column='idCategoria', null=True, blank=True)
    #id_escuela = models.ForeignKey(Escuela, on_delete=models.SET_NULL, db_column='id_escuela', null=True, blank=True)

    class Meta:
        db_table = 'usuario'

class Torneo(models.Model):
    idTorneo = models.AutoField(primary_key=True)
    nombre_torneo = models.CharField(max_length=255)
    tipo = models.CharField(max_length=50, null=True, blank=True) 
    rama = models.CharField(max_length=50, null=True, blank=True) 
    numeroGrupos = models.IntegerField(null=True, blank=True)
    tamanoGrupos = models.IntegerField(null=True, blank=True)
    rondaActual = models.CharField(max_length=50, null=True, blank=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=50, null=True, blank=True) 
    
    # FKs
    formato_id = models.ForeignKey(Formato, on_delete=models.RESTRICT, db_column='formato_id')
    categoria_id = models.ForeignKey(Categoria, on_delete=models.RESTRICT, db_column='categoria_id')

    class Meta:
        db_table = 'torneo'

class gruposCategoria(models.Model):
    idgrupoCategoria = models.AutoField(primary_key=True)
    Nombre = models.CharField(max_length=255)
    
    # FK
    Torneo_id = models.ForeignKey(Torneo, on_delete=models.CASCADE, db_column='Torneo_id')

    class Meta:
        db_table = 'gruposcategoria'
        unique_together = (('Nombre', 'Torneo_id'),) # UNIQUE ("Nombre", "Torneo_id")

class Cuadro(models.Model):
    idCuadro = models.AutoField(primary_key=True)
    tamanoCuadro = models.IntegerField()
    
    # FK
    Torneo_id = models.OneToOneField(Torneo, on_delete=models.CASCADE, db_column='Torneo_id', unique=True) # OneToOneField por UNIQUE

    class Meta:
        db_table = 'cuadro'
        
class Inscripciones(models.Model):
    idInscripciones = models.AutoField(primary_key=True)
    estado = models.CharField(max_length=50)
    fecha_inscripcion = models.DateField(auto_now_add=True)
    
    # FKs
    Torneo_id = models.ForeignKey(Torneo, on_delete=models.CASCADE, db_column='Torneo_id')
    jugador_1_id = models.ForeignKey(Usuario, on_delete=models.RESTRICT, related_name='inscripciones_j1', db_column='jugador_1_id')
    jugador_2_id = models.ForeignKey(Usuario, on_delete=models.SET_NULL, related_name='inscripciones_j2', db_column='jugador_2_id', null=True, blank=True)

    class Meta:
        db_table = 'inscripciones'
        unique_together = (('Torneo_id', 'jugador_1_id', 'jugador_2_id'),)


class Partido(models.Model):
    idPartido = models.AutoField(primary_key=True)
    ronda = models.CharField(max_length=50)
    posicion = models.IntegerField(null=True, blank=True)
    estado = models.CharField(max_length=50, null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)
    hora = models.TimeField(null=True, blank=True)
    
    # FKs
    grupo_id = models.ForeignKey(gruposCategoria, on_delete=models.SET_NULL, db_column='grupo_id', null=True, blank=True)
    ins_a_id = models.ForeignKey(Inscripciones, on_delete=models.RESTRICT, related_name='partidos_a', db_column='ins_a_id')
    ins_b_id = models.ForeignKey(Inscripciones, on_delete=models.RESTRICT, related_name='partidos_b', db_column='ins_b_id')
    ganador_ins_id = models.ForeignKey(Inscripciones, on_delete=models.SET_NULL, related_name='partidos_ganados', db_column='ganador_ins_id', null=True, blank=True)

    class Meta:
        db_table = 'partido'

class Sets(models.Model):
    idSets = models.AutoField(primary_key=True)
    numSet = models.IntegerField()
    juegos_i1 = models.IntegerField()
    juegos_i2 = models.IntegerField()
    
    # FK
    partido_id = models.ForeignKey(Partido, on_delete=models.CASCADE, db_column='partido_id')

    class Meta:
        db_table = 'sets'
        unique_together = (('numSet', 'partido_id'),) # Restricción UNIQUE en el diagrama
        
""" class SetsPorMuerte(models.Model):
    idSetsPorMuerte = models.AutoField(primary_key=True)
    juegos_i1 = models.IntegerField() 
    juegos_i2 = models.IntegerField()
    
    # FK
    partido_id = models.ForeignKey(Partido, on_delete=models.CASCADE, db_column='partido_id')

    class Meta:
        db_table = 'setspormuerte' """

# --- Tablas de Relación y Estadísticas ---

class MiembrosGrupo(models.Model):
    idMiembrosGrupo = models.AutoField(primary_key=True)
    
    # FKs
    grupo_id = models.ForeignKey(gruposCategoria, on_delete=models.CASCADE, db_column='grupo_id')
    inscripciones_id = models.ForeignKey(Inscripciones, on_delete=models.CASCADE, db_column='inscripciones_id')

    class Meta:
        db_table = 'miembrosgrupo'
        unique_together = (('grupo_id', 'inscripciones_id'),)

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
    
    # FKs
    Torneo_id = models.ForeignKey(Torneo, on_delete=models.CASCADE, db_column='Torneo_id')
    grupo_id = models.ForeignKey(gruposCategoria, on_delete=models.CASCADE, db_column='grupo_id')
    inscripciones_id = models.ForeignKey(Inscripciones, on_delete=models.CASCADE, db_column='inscripciones_id')

    class Meta:
        db_table = 'posicionesgrupo'
        unique_together = (('Torneo_id', 'grupo_id', 'inscripciones_id'),)

class Disponibilidad(models.Model):
    idDisponibilidad = models.AutoField(primary_key=True)
    diaSemana = models.CharField(max_length=10) 
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    esta_disponible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'disponibilidad'
        verbose_name_plural = "Disponibilidad"