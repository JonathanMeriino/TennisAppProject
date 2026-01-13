from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
# Create your models here.
# --- Tablas Base e Independientes ---

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

# Necesitas un Manager para manejar la creación de usuarios desde consola
class UsuarioManager(BaseUserManager):
    def create_user(self, correo, nombreUsuario, password=None, **extra_fields):
        if not correo:
            raise ValueError('El usuario debe tener un correo electrónico')
        correo = self.normalize_email(correo)
        user = self.model(correo=correo, nombreUsuario=nombreUsuario, **extra_fields)
        user.set_password(password) # Esto hashea la contraseña automáticamente
        user.save(using=self._db)
        return user

    def create_superuser(self, correo, nombreUsuario, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(correo, nombreUsuario, password, **extra_fields)

class Usuario(AbstractBaseUser, PermissionsMixin):
    idUsuario = models.AutoField(primary_key=True)
    nombreUsuario = models.CharField(max_length=255, unique=True)
    edad = models.IntegerField(null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=[('M', 'Masculino'), ('F', 'Femenino')], null=True, blank=True)
    boleta = models.IntegerField(unique=True)
    correo = models.EmailField(max_length=50, unique=True)
    
    # Campos obligatorios para compatibilidad con Django
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # FKs existentes
    idRol = models.ForeignKey('Roles', on_delete=models.RESTRICT, db_column='idRol', null=True, blank=True)
    idCategoria = models.ForeignKey('Categoria', on_delete=models.SET_NULL, db_column='idCategoria', null=True, blank=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'correo'          # Campo para iniciar sesión
    REQUIRED_FIELDS = ['nombreUsuario', 'boleta'] # Campos para el createsuperuser

    class Meta:
        db_table = 'usuario' # Mantiene el nombre de tu tabla en Postgres

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


class Inscripciones(models.Model):
    idInscripcion = models.AutoField(primary_key=True)
    estadoIncripcion = models.CharField(max_length=50)
    fecha_inscripcion = models.DateField(auto_now_add=True)
    
    # FKs
    torneo_id = models.ForeignKey(Torneo, on_delete=models.CASCADE, db_column='torneo_id')
    
    # El campo es UNIQUE NOT NULL, pero como FK, usamos OneToOneField y related_name
    jugador_1_id = models.OneToOneField(Usuario, on_delete=models.RESTRICT, related_name='inscripcion_j1', db_column='jugador_1_id')
    
    # El campo es UNIQUE (permitiendo NULL), usamos OneToOneField y related_name
    jugador_2_id = models.OneToOneField(Usuario, on_delete=models.SET_NULL, related_name='inscripcion_j2', db_column='jugador_2_id', null=True, blank=True)

    class Meta:
        db_table = 'inscripciones'
        verbose_name_plural = "Inscripciones"


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
    
    # FKs
    grupo_id = models.ForeignKey(GruposCategoria, on_delete=models.SET_NULL, db_column='grupo_id', null=True, blank=True)
    ins_a_id = models.ForeignKey(Inscripciones, on_delete=models.RESTRICT, related_name='partidos_a', db_column='ins_a_id')
    ins_b_id = models.ForeignKey(Inscripciones, on_delete=models.RESTRICT, related_name='partidos_b', db_column='ins_b_id')
    ganador_ins_id = models.ForeignKey(Inscripciones, on_delete=models.SET_NULL, related_name='partidos_ganados', db_column='ganador_ins_id', null=True, blank=True)

    class Meta:
        db_table = 'partido'
        verbose_name_plural = "Partidos"


class Sets(models.Model):
    idSets = models.AutoField(primary_key=True)
    numSet = models.IntegerField(unique=True) 
    juegos_j1 = models.IntegerField()
    juegos_j2 = models.IntegerField()
    
    # FK (OneToOneField debido a la restricción UNIQUE NOT NULL en partido_id en SQL)
    partido_id = models.OneToOneField(Partido, on_delete=models.CASCADE, db_column='partido_id')

    class Meta:
        db_table = 'Sets'
        verbose_name_plural = "Sets"