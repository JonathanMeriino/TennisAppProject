# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Categoria(models.Model):
    idcategoria = models.AutoField(primary_key=True)
    nombrecategoria = models.CharField(unique=True, max_length=255)
    ranking = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'categoria'


class Cuadro(models.Model):
    idcuadro = models.AutoField(primary_key=True)
    tamanocuadro = models.IntegerField()
    torneo = models.OneToOneField('Torneo', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'cuadro'


class Disponibilidad(models.Model):
    iddisponibilidad = models.AutoField(primary_key=True)
    diasemana = models.CharField(max_length=10)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    esta_disponible = models.BooleanField()
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    inscripcion = models.ForeignKey('Inscripciones', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'disponibilidad'


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class Formato(models.Model):
    idformato = models.AutoField(primary_key=True)
    nombreformato = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'formato'


class Gruposcategoria(models.Model):
    idgrupocategoria = models.AutoField(primary_key=True)
    nombregrupo = models.CharField(unique=True, max_length=50)
    torneo = models.ForeignKey('Torneo', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'gruposcategoria'


class Inscripciones(models.Model):
    idinscripcion = models.AutoField(primary_key=True)
    estadoincripcion = models.CharField(max_length=50)
    fecha_inscripcion = models.DateField(blank=True, null=True)
    torneo = models.ForeignKey('Torneo', models.DO_NOTHING)
    jugador_1 = models.OneToOneField('Usuario', models.DO_NOTHING)
    jugador_2 = models.OneToOneField('Usuario', models.DO_NOTHING, related_name='inscripciones_jugador_2_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'inscripciones'


class Miembrosgrupo(models.Model):
    idmiembrosgrupo = models.AutoField(primary_key=True)
    grupo = models.OneToOneField(Gruposcategoria, models.DO_NOTHING)
    inscripcion = models.OneToOneField(Inscripciones, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'miembrosgrupo'


class Partido(models.Model):
    idpartido = models.AutoField(primary_key=True)
    estado = models.CharField(max_length=50, blank=True, null=True)
    fechapartido = models.DateField(blank=True, null=True)
    horapartido = models.TimeField(blank=True, null=True)
    grupo_id = models.IntegerField(blank=True, null=True)
    ins_a = models.ForeignKey(Inscripciones, models.DO_NOTHING)
    ins_b = models.ForeignKey(Inscripciones, models.DO_NOTHING, related_name='partido_ins_b_set')
    ganador_ins = models.ForeignKey(Inscripciones, models.DO_NOTHING, related_name='partido_ganador_ins_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'partido'


class Posicionesgrupo(models.Model):
    idposiciongrupo = models.AutoField(primary_key=True)
    partidosjugados = models.IntegerField()
    partidosganados = models.IntegerField()
    partidosperdidos = models.IntegerField()
    setsfavor = models.IntegerField()
    setscontra = models.IntegerField()
    juegosfavor = models.IntegerField()
    juegoscontra = models.IntegerField()
    puntos = models.IntegerField()
    torneo = models.OneToOneField('Torneo', models.DO_NOTHING)
    grupo = models.OneToOneField(Gruposcategoria, models.DO_NOTHING)
    inscripcion = models.OneToOneField(Inscripciones, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'posicionesgrupo'


class Roles(models.Model):
    idrol = models.AutoField(primary_key=True)
    nombrerol = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'roles'


class Sets(models.Model):
    idsets = models.AutoField(primary_key=True)
    numset = models.IntegerField(unique=True)
    juegos_j1 = models.IntegerField()
    juegos_j2 = models.IntegerField()
    partido = models.OneToOneField(Partido, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'sets'


class Torneo(models.Model):
    idtorneo = models.AutoField(primary_key=True)
    nombretorneo = models.CharField(max_length=255)
    tipo = models.CharField(max_length=50, blank=True, null=True)
    rama = models.CharField(max_length=50, blank=True, null=True)
    numerogrupos = models.IntegerField(blank=True, null=True)
    tamanogrupos = models.IntegerField(blank=True, null=True)
    fechainicio = models.DateField()
    fechafin = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=50, blank=True, null=True)
    formato = models.ForeignKey(Formato, models.DO_NOTHING)
    categoria = models.ForeignKey(Categoria, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'torneo'


class Usuario(models.Model):
    idusuario = models.AutoField(primary_key=True)
    nombreusuario = models.CharField(max_length=255)
    edad = models.IntegerField(blank=True, null=True)
    sexo = models.CharField(max_length=1, blank=True, null=True)
    boleta = models.IntegerField(unique=True)
    correo = models.CharField(unique=True, max_length=50)
    contrasena = models.CharField(max_length=255)
    hash = models.CharField(max_length=255, blank=True, null=True)
    idrol = models.ForeignKey(Roles, models.DO_NOTHING, db_column='idrol')
    idcategoria = models.ForeignKey(Categoria, models.DO_NOTHING, db_column='idcategoria', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuario'
