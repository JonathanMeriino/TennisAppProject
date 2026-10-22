import json
import math
import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticatedOrReadOnly
from ortools.sat.python import cp_model  # <--- IMPORTACIÓN DEL SOLVER DE GOOGLE

from .serializer import (RolesSerializer, UserSerializer, TorneoSerializer, InscripcionesSerializer, PartidoSerializer,ResultadoSerializer )
from .models import (
    Roles, User, Torneo,
    Inscripcion, Partido, Resultado
)
from .permissions import IsAdminUserCustom

# =========================================================================
# FUNCIÓN GLOBAL: PROGRAMACIÓN DINÁMICA (JUST-IN-TIME)
# =========================================================================
def asignar_horario_dinamico(partido):
    """
    Cruza las disponibilidades de dos jugadores y busca espacio en la base de datos.
    Solo se ejecuta si el partido ya tiene a ambos contendientes definidos.
    Asegura que el partido se programe DESPUÉS de las fechas en que los jugadores
    ganaron sus llaves previas.
    """
    if not partido.jugador1 or not partido.jugador2:
        return False

    torneo = partido.torneo
    canchas_disponibles = getattr(torneo, 'canchas_disponibles', 2)
    horarios_bloque = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"]
    dias_semana = {0: "Lunes", 1: "Martes", 2: "Miércoles", 3: "Jueves", 4: "Viernes", 5: "Sábado", 6: "Domingo"}

    def normalizar_dia(dia):
        return dia.replace('é','e').replace('á','a').replace('í','i').replace('ó','o').replace('ú','u').lower()

    def get_matriz(jug):
        m = jug.matriz_disponibilidad
        if isinstance(m, str):
            try: return json.loads(m)
            except: return {}
        return m or {}

    m1 = get_matriz(partido.jugador1)
    m2 = get_matriz(partido.jugador2)

    # 1. --- CÁLCULO DE LA FECHA BASE (EVITAR VIAJES EN EL TIEMPO) ---
    hoy = datetime.date.today()
    fecha_minima_calculada = hoy
    
    partidos_previos = Partido.objects.filter(
        partido_siguiente=partido, 
        estado='Finalizado'
    )
    
    for previo in partidos_previos:
        if previo.fecha:
            fecha_previo = previo.fecha
            if isinstance(fecha_previo, str):
                fecha_previo = datetime.datetime.strptime(fecha_previo, '%Y-%m-%d').date()
            if fecha_previo >= fecha_minima_calculada:
                fecha_minima_calculada = fecha_previo + datetime.timedelta(days=1)
                
    if fecha_minima_calculada <= hoy:
        fecha_minima_calculada = hoy + datetime.timedelta(days=1)

    agendado = False

    # 2. --- Intento 1: Intersección Matemática Voraz ---
    for offset in range(14): 
        eval_date = fecha_minima_calculada + datetime.timedelta(days=offset)
        dia_str = normalizar_dia(dias_semana[eval_date.weekday()])
        
        d1 = [k for k in m1.keys() if normalizar_dia(k) == dia_str]
        d2 = [k for k in m2.keys() if normalizar_dia(k) == dia_str]
        
        if d1 and d2:
            comunes = set(m1[d1[0]]).intersection(set(m2[d2[0]]))
            for hora_raw in comunes:
                hora_limpia = hora_raw.split("-")[0].strip() if "-" in hora_raw else hora_raw.strip()
                if hora_limpia in horarios_bloque:
                    ocupadas = Partido.objects.filter(torneo=torneo, fecha=eval_date, hora=hora_limpia).count()
                    if ocupadas < canchas_disponibles:
                        partido.fecha = eval_date.strftime('%Y-%m-%d')
                        partido.hora = hora_limpia
                        partido.estado = 'Programado'
                        partido.save()
                        return True

    # 3. --- Intento 2: Fallback (Fin de semana) si no tienen agendas compatibles ---
    if not agendado:
        eval_date = fecha_minima_calculada
        while (eval_date - fecha_minima_calculada).days < 21:
            if eval_date.weekday() in [5, 6]: 
                for hora in horarios_bloque:
                    ocupadas = Partido.objects.filter(torneo=torneo, fecha=eval_date, hora=hora).count()
                    if ocupadas < canchas_disponibles:
                        partido.fecha = eval_date.strftime('%Y-%m-%d')
                        partido.hora = hora
                        partido.estado = 'Programado'
                        partido.save()
                        return True
            eval_date += datetime.timedelta(days=1)
            
    return False

# =========================================================================
# CONTROLADORES DE LA API (VIEWS)
# =========================================================================

class GetUserViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get (self,request):
        user = request.user
        perfil = getattr(user, 'perfil', None)

        categoria_val = None
        if perfil and perfil.categoria:
            categoria_val = getattr(perfil.categoria, 'nombre_categoria', str(perfil.categoria))

        return Response({
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "date_joined": user.date_joined,
            "perfil": {
                "boleta_usuario": perfil.boleta_usuario if perfil else None,
                "categoria": categoria_val,
                "edad_usuario": perfil.edad_usuario if perfil else None,
                "sexo_usuario": perfil.sexo_usuario if perfil else None,
                "escuela_usuario": perfil.escuela_usuario if perfil else None,
                "rol": perfil.rol.nombre_rol if perfil and perfil.rol else None
            }
        })
        
    def put(self, request):
        user = request.user
        perfil = getattr(user, 'perfil', None)

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=400)

        if perfil:
            edad = request.data.get('edad_usuario', perfil.edad_usuario)
            escuela = request.data.get('escuela_usuario', perfil.escuela_usuario)

            if edad is not None and edad != '':
                perfil.edad_usuario = edad
            if escuela is not None and escuela != '':
                perfil.escuela_usuario = escuela
            perfil.save()
        
        return Response({"message": "Perfil actualizado correctamente"})
        
class RolesViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolesSerializer
    
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TorneoViewSet(viewsets.ModelViewSet):
    queryset = Torneo.objects.all()
    serializer_class = TorneoSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], url_path='generar_bracket')
    def generar_bracket(self, request, pk=None):
        torneo = self.get_object()
        inscripciones = list(torneo.inscripciones.all())
        num_jugadores = len(inscripciones)
        
        if num_jugadores < 2:
            return Response({"error": "Se requieren mínimo 2 jugadores."}, status=status.HTTP_400_BAD_REQUEST)
            
        potencia_superior = 2 ** math.ceil(math.log2(num_jugadores))
        total_rondas = int(math.log2(potencia_superior))
        num_byes = potencia_superior - num_jugadores
        
        torneo.partidos.all().delete()
        partidos_por_ronda = {}
        
        def definir_nombre_fase(ronda_actual, rondas_totales):
            if ronda_actual == rondas_totales: return "Final"
            if ronda_actual == rondas_totales - 1: return "Semifinal"
            if ronda_actual == rondas_totales - 2: return "Cuartos de Final"
            return f"Ronda de {2 ** (rondas_totales - ronda_actual + 1)}"

        for r in range(total_rondas, 0, -1):
            fase_nombre = definir_nombre_fase(r, total_rondas)
            creados_en_ronda = []
            for i in range(potencia_superior // (2 ** r)):
                p_siguiente = partidos_por_ronda[r + 1][i // 2] if r < total_rondas else None
                partido = Partido.objects.create(torneo=torneo, fase=fase_nombre, partido_siguiente=p_siguiente)
                creados_en_ronda.append(partido)
            partidos_por_ronda[r] = creados_en_ronda

        # =========================================================================
        # ETAPA 3: GENERACIÓN DEL CUADRO (DIVIDE Y VENCERÁS)
        # =========================================================================
        sembrados_dict = {}
        sin_siembra = []
        
        for ins in inscripciones:
            try:
                num = int(ins.numero_siembra)
                if num > 0: sembrados_dict[num] = ins
                else: sin_siembra.append(ins)
            except (TypeError, ValueError):
                sin_siembra.append(ins)

        def generar_patron_siembras(n):
            if n <= 1: return [1]
            if n == 2: return [1, 2]
            patron_previo = generar_patron_siembras(n // 2)
            patron_actual = []
            for siembra in patron_previo:
                patron_actual.extend([siembra, n - siembra + 1])
            return patron_actual

        patron_atp = generar_patron_siembras(potencia_superior)
        slots = [None] * potencia_superior
        umbral_bye = potencia_superior - num_byes
        
        for i, p in enumerate(patron_atp):
            if p > umbral_bye: slots[i] = 'BYE'
            elif p in sembrados_dict: slots[i] = sembrados_dict.pop(p)
                
        # =========================================================================
        # ETAPA 4: EMPAREJAMIENTO DE SLOTS (CP-SAT / SOLUCIÓN ÓPTIMA GLOBAL)
        # =========================================================================
        restantes = list(sembrados_dict.values()) + sin_siembra
        vacios = [i for i, val in enumerate(slots) if val is None]
        
        def get_matriz(jug):
            if not jug or not jug.matriz_disponibilidad: return {}
            m = jug.matriz_disponibilidad
            if isinstance(m, str):
                try: return json.loads(m)
                except: return {}
            return m

        def son_compatibles(jug_1, jug_2):
            m1, m2 = get_matriz(jug_1), get_matriz(jug_2)
            if not m1 or not m2: return True
            dias_comunes = set(m1.keys()).intersection(set(m2.keys()))
            for dia in dias_comunes:
                if set(m1[dia]).intersection(set(m2[dia])): return True
            return False

        # Solo ejecutar el modelo CP-SAT si hay jugadores para emparejar
        if restantes and vacios:
            model = cp_model.CpModel()
            
            # Variables de decisión: assign[p, v] = 1 si el jugador 'p' ocupa el slot vacío 'v'
            assign = {}
            for p in range(len(restantes)):
                for v in range(len(vacios)):
                    assign[p, v] = model.NewBoolVar(f'assign_{p}_{v}')
                    
            # Restricciones de unicidad: 1 jugador por slot, 1 slot por jugador
            for p in range(len(restantes)):
                model.AddExactlyOne([assign[p, v] for v in range(len(vacios))])
            for v in range(len(vacios)):
                model.AddExactlyOne([assign[p, v] for p in range(len(restantes))])
                
            match_compat_vars = []
            
            # Evaluar los partidos de la primera ronda
            for i in range(potencia_superior // 2):
                idx_a = i * 2
                idx_b = i * 2 + 1
                val_a = slots[idx_a]
                val_b = slots[idx_b]
                
                # Caso A: Ambos slots están vacíos (se enfrentan dos jugadores de 'restantes')
                if val_a is None and val_b is None:
                    v_a = vacios.index(idx_a)
                    v_b = vacios.index(idx_b)
                    is_compat = model.NewBoolVar(f'compat_match_{i}')
                    match_compat_vars.append(is_compat)
                    
                    for p1 in range(len(restantes)):
                        for p2 in range(len(restantes)):
                            if p1 == p2: continue
                            if not son_compatibles(restantes[p1], restantes[p2]):
                                # Si p1 está en v_a y p2 está en v_b, y NO son compatibles, is_compat DEBE ser 0
                                model.AddBoolOr([assign[p1, v_a].Not(), assign[p2, v_b].Not(), is_compat.Not()])
                                
                # Caso B: El slot A está vacío y el slot B tiene a un cabeza de serie
                elif val_a is None and val_b is not None and val_b != 'BYE':
                    v_a = vacios.index(idx_a)
                    is_compat = model.NewBoolVar(f'compat_match_{i}')
                    match_compat_vars.append(is_compat)
                    for p in range(len(restantes)):
                        if not son_compatibles(restantes[p], val_b):
                            model.AddImplication(assign[p, v_a], is_compat.Not())
                            
                # Caso C: El slot B está vacío y el slot A tiene a un cabeza de serie
                elif val_b is None and val_a is not None and val_a != 'BYE':
                    v_b = vacios.index(idx_b)
                    is_compat = model.NewBoolVar(f'compat_match_{i}')
                    match_compat_vars.append(is_compat)
                    for p in range(len(restantes)):
                        if not son_compatibles(restantes[p], val_a):
                            model.AddImplication(assign[p, v_b], is_compat.Not())
                            
            # Función Objetivo: Maximizar los partidos con horarios compatibles
            if match_compat_vars:
                model.Maximize(sum(match_compat_vars))
                
            solver = cp_model.CpSolver()
            solver.parameters.max_time_in_seconds = 5.0  # Límite de tiempo de seguridad
            solver_status = solver.Solve(model)
            
            # Extraer los resultados si el modelo encuentra la solución óptima
            if solver_status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
                for p in range(len(restantes)):
                    for v in range(len(vacios)):
                        if solver.Value(assign[p, v]):
                            slots[vacios[v]] = restantes[p]
            else:
                # Fallback de seguridad por si no convergiere
                for i, v in enumerate(vacios):
                    slots[v] = restantes[i]

        partidos_primera_ronda = partidos_por_ronda[1]
        for i in range(len(partidos_primera_ronda)):
            partido = partidos_primera_ronda[i]
            partido.jugador1 = slots[i * 2] if slots[i * 2] != 'BYE' else None
            partido.jugador2 = slots[(i * 2) + 1] if slots[(i * 2) + 1] != 'BYE' else None
            partido.save()

        # =========================================================================
        # ETAPA 5: PLANIFICADOR GLOBAL LIMPIO (MODO JUST-IN-TIME)
        # =========================================================================
        for r in range(1, total_rondas + 1):
            for partido in partidos_por_ronda[r]:
                partido.refresh_from_db()
                
                # --- MANEJO DE BYES (SOLO EN LA PRIMERA RONDA) ---
                if r == 1 and (
                    (partido.jugador1 is not None and partido.jugador2 is None) or 
                    (partido.jugador1 is None and partido.jugador2 is not None)
                ):
                    jugador_avanza = partido.jugador1 if partido.jugador1 else partido.jugador2
                    partido.estado = 'Finalizado'
                    partido.save()
                    
                    if partido.partido_siguiente:
                        sig = partido.partido_siguiente
                        if sig.jugador1 is None: sig.jugador1 = jugador_avanza
                        elif sig.jugador2 is None: sig.jugador2 = jugador_avanza
                        sig.save()
                    continue
                    
                # Programación dinámica de partidos con ambos jugadores definidos
                if partido.jugador1 and partido.jugador2 and partido.estado != 'Finalizado':
                    asignar_horario_dinamico(partido)

        torneo.estado_torneo = 'En Curso'
        torneo.save()

        return Response({"status": f"Cuadro estructurado. Partidos iniciales agendados para {num_jugadores} competidores."}, status=status.HTTP_201_CREATED)
        
    @action(detail=True, methods = ['post'])
    def inscribir(self, request, pk=None):
        torneo = self.get_object()
        user = request.user
        if torneo.estado_torneo != 'Programado':
            return Response({"detail": "No puedes inscribirte en un torneo que ya ha comenzado o finalizado."}, status=status.HTTP_400_BAD_REQUEST) 

        perfil = getattr(user, 'perfil', None)
        sexo_usuario = perfil.sexo_usuario if perfil else None
        rama_torneo = torneo.rama_torneo

        if rama_torneo != 'Mixto' and sexo_usuario:
            es_masculino = sexo_usuario.lower() in ['masculino', 'hombre', 'm','varonil']
            es_femenino = sexo_usuario.lower() in ['femenino', 'mujer','femenil', 'f']

            if rama_torneo == 'Varonil' and not es_masculino:
                return Response({"detail": "Este torneo es solo para jugadores varoniles."}, status=status.HTTP_400_BAD_REQUEST)
            if rama_torneo == 'Femenil' and not es_femenino:
                return Response({"detail": "Este torneo es solo para jugadoras femeniles."}, status=status.HTTP_400_BAD_REQUEST)
        
        matriz_disponibilidad = request.data.get('matriz_disponibilidad')
        inscripcion, created = Inscripcion.objects.get_or_create(
            torneo=torneo,
            jugador=user,
            defaults={'matriz_disponibilidad': matriz_disponibilidad}
        )
        
        if not created:
            return Response({"detail": "Ya estás inscrito en este torneo."}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({"detail": "Inscripción exitosa."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'])
    def cancelar_inscripcion(self, request, pk=None):
        torneo = self.get_object()
        user = request.user
        try:
            inscripcion = Inscripcion.objects.get(torneo=torneo, jugador=user)
            inscripcion.delete()
            return Response({"detail": "Inscripción cancelada exitosamente."}, status=status.HTTP_200_OK)
        except Inscripcion.DoesNotExist:
            return Response({"detail": "No estás inscrito en este torneo."}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=True, methods=['get'])
    def inscripciones(self, request, pk=None):
        torneo = self.get_object()
        inscripciones = torneo.inscripciones.all() 
        serializer = InscripcionesSerializer(inscripciones, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def mis_inscripciones(self, request):
        torneos_inscritos = Torneo.objects.filter(inscripciones__jugador=request.user)
        serializer = TorneoSerializer(torneos_inscritos, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def partidos(self, request, pk=None):
        torneo = self.get_object()
        partidos = torneo.partidos.all().order_by('id_partido') 
        serializer = PartidoSerializer(partidos, many=True)
        return Response(serializer.data)

class InscripcionViewSet(viewsets.ModelViewSet):
    serializer_class = InscripcionesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'perfil') and user.perfil.rol and user.perfil.rol.nombre_rol == 'Administrador'):
            return Inscripcion.objects.all()
        return Inscripcion.objects.filter(jugador=user)

class PartidoViewSet(viewsets.ModelViewSet):
    queryset = Partido.objects.all()
    serializer_class = PartidoSerializer

class ResultadoViewSet(viewsets.ModelViewSet):
    queryset = Resultado.objects.all()
    serializer_class = ResultadoSerializer

    def perform_create(self, serializer):
        resultado = serializer.save()
        partido = resultado.partido
        ganador = resultado.ganador

        # Cierra el partido y marca como finalizado
        partido.estado = 'Finalizado'
        partido.save()
        
        # Motor de avance automático
        if partido.partido_siguiente:
            sig_partido = partido.partido_siguiente
            if sig_partido.jugador1 is None:
                sig_partido.jugador1 = ganador
            elif sig_partido.jugador2 is None:
                sig_partido.jugador2 = ganador
            sig_partido.save()

            # Disparador de programación dinámica para el siguiente partido si ambos jugadores están definidos
            if sig_partido.jugador1 and sig_partido.jugador2:
                asignar_horario_dinamico(sig_partido)

        es_partido_final = False
        
        if not partido.partido_siguiente:
            es_partido_final = True
        elif hasattr(partido, 'fase') and partido.fase and 'final' in str(partido.fase).lower():
            es_partido_final = True

        if es_partido_final:
            torneo = getattr(partido, 'torneo', None)
            if torneo:
                torneo.estado_torneo = 'Finalizado'
                torneo.save()