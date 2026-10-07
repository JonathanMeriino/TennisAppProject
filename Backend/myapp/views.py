import json
import math
import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticatedOrReadOnly
from .serializer import (RolesSerializer, UserSerializer, TorneoSerializer, InscripcionesSerializer, PartidoSerializer,ResultadoSerializer )
from .models import (
    Roles, User, Torneo,
    Inscripcion, Partido, Resultado
)
from .permissions import IsAdminUserCustom

# Create your views here.
class GetUserViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get (self,request):
        user = request.user
        perfil = getattr(user, 'perfil', None)

        #Obtenermos el valor de la categoria

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

        # Actualizar los campos del modelo User
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=400)

        # Actualizar los campos especificos del perfil (edad, escuela) 
        if perfil:
            # Obtenemos lso datos enviados desde el request
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
        # Permitir que cualquier usuario autenticado vea (GET), 
        # pero exigir que sea Administrador para crear, actualizar o borrar (POST, PUT, DELETE)
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
        # ETAPA 4: EMPAREJAMIENTO DE SLOTS (GREEDY BASE)
        # =========================================================================
        restantes = list(sembrados_dict.values()) + sin_siembra
        
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
            
        partidos_primera_ronda = partidos_por_ronda[1]

        for i in range(potencia_superior // 2):
            idx_a = i * 2
            idx_b = (i * 2) + 1
            
            if slots[idx_a] is None and slots[idx_b] is None and restantes:
                jugador_base = restantes.pop(0)
                slots[idx_a] = jugador_base
                rival = next((c for c in restantes if son_compatibles(jugador_base, c)), None)
                if rival: restantes.remove(rival)
                slots[idx_b] = rival if rival else (restantes.pop(0) if restantes else None)
                
            elif slots[idx_a] is not None and slots[idx_a] != 'BYE' and slots[idx_b] is None and restantes:
                rival = next((c for c in restantes if son_compatibles(slots[idx_a], c)), None)
                if rival: restantes.remove(rival)
                slots[idx_b] = rival if rival else (restantes.pop(0) if restantes else None)
                
            elif slots[idx_b] is not None and slots[idx_b] != 'BYE' and slots[idx_a] is None and restantes:
                rival = next((c for c in restantes if son_compatibles(slots[idx_b], c)), None)
                if rival: restantes.remove(rival)
                slots[idx_a] = rival if rival else (restantes.pop(0) if restantes else None)

        for i in range(len(partidos_primera_ronda)):
            partido = partidos_primera_ronda[i]
            partido.jugador1 = slots[i * 2] if slots[i * 2] != 'BYE' else None
            partido.jugador2 = slots[(i * 2) + 1] if slots[(i * 2) + 1] != 'BYE' else None
            partido.save()

        # =========================================================================
        # ETAPA 5: PLANIFICADOR GLOBAL (HORARIOS, CANCHAS Y DESCANSOS)
        # =========================================================================
        canchas_disponibles = getattr(torneo, 'canchas_disponibles', 2) # Máximo 2 partidos
        horarios_bloque = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"]
        
        canchas_uso = {} # { fecha: { "08:00": 1, ... } }
        jugador_uso = {} # { username: set(fechas) }
        fecha_minima_por_partido = {} # Para respetar la cronología de rondas
        hoy = datetime.date.today()

        def normalizar_dia(dia):
            return dia.replace('é','e').replace('á','a').replace('í','i').replace('ó','o').replace('ú','u').lower()

        for r in range(1, total_rondas + 1):
            for partido in partidos_por_ronda[r]:
                # Refrescar desde BD para traer jugadores propagados de rondas anteriores
                partido.refresh_from_db()
                
                # --- MANEJO DE BYES ---
                if (partido.jugador1 is not None and partido.jugador2 is None) or \
                (partido.jugador1 is None and partido.jugador2 is not None):
                    
                    jugador_avanza = partido.jugador1 if partido.jugador1 else partido.jugador2
                    partido.estado = 'Finalizado'
                    partido.save()
                    
                    if partido.partido_siguiente:
                        sig = partido.partido_siguiente
                        if sig.jugador1 is None: sig.jugador1 = jugador_avanza
                        elif sig.jugador2 is None: sig.jugador2 = jugador_avanza
                        sig.save()
                        
                        # Herencia cronológica (no toma tiempo)
                        f_min = fecha_minima_por_partido.get(partido.id_partido, hoy + datetime.timedelta(days=1))
                        curr_min = fecha_minima_por_partido.get(sig.id_partido, hoy)
                        fecha_minima_por_partido[sig.id_partido] = max(curr_min, f_min)
                    continue
                    
                # --- MANEJO DE PARTIDOS REALES ---
                jug1, jug2 = partido.jugador1, partido.jugador2
                fecha_min = fecha_minima_por_partido.get(partido.id_partido, hoy + datetime.timedelta(days=1))
                agendado = False
                fecha_agendada = None
                hora_agendada = None
                
                def is_slot_available(f, h):
                    if canchas_uso.get(f, {}).get(h, 0) >= canchas_disponibles: return False
                    # Cruzamos la llave foránea 'jugador' para acceder al username
                    if jug1 and f in jugador_uso.get(jug1.jugador.username, set()): return False
                    if jug2 and f in jugador_uso.get(jug2.jugador.username, set()): return False
                    return True
                
                def book_slot(f, h):
                    if f not in canchas_uso: canchas_uso[f] = {b: 0 for b in horarios_bloque}
                    canchas_uso[f][h] += 1
                    # Cruzamos la llave foránea 'jugador' para registrar el uso
                    if jug1: jugador_uso.setdefault(jug1.jugador.username, set()).add(f)
                    if jug2: jugador_uso.setdefault(jug2.jugador.username, set()).add(f)

                # Intento 1: Compatibilidad de Matriz (Solo si conocemos a ambos jugadores)
                if jug1 and jug2:
                    m1, m2 = get_matriz(jug1), get_matriz(jug2)
                    dias_semana = {0: "Lunes", 1: "Martes", 2: "Miércoles", 3: "Jueves", 4: "Viernes", 5: "Sábado", 6: "Domingo"}
                    
                    for offset in range(14): # Buscar en las próximas 2 semanas
                        eval_date = fecha_min + datetime.timedelta(days=offset)
                        dia_str = normalizar_dia(dias_semana[eval_date.weekday()])
                        
                        d1 = [k for k in m1.keys() if normalizar_dia(k) == dia_str]
                        d2 = [k for k in m2.keys() if normalizar_dia(k) == dia_str]
                        
                        if d1 and d2:
                            comunes = set(m1[d1[0]]).intersection(set(m2[d2[0]]))
                            for hora_raw in comunes:
                                hora_limpia = hora_raw.split("-")[0].strip() if "-" in hora_raw else hora_raw.strip()
                                if hora_limpia in horarios_bloque and is_slot_available(eval_date, hora_limpia):
                                    book_slot(eval_date, hora_limpia)
                                    fecha_agendada, hora_agendada = eval_date, hora_limpia
                                    agendado = True
                                    break
                        if agendado: break

                # Intento 2: Fallback al Fin de Semana o Siguiente Día Hábil (Obligatorio)
                if not agendado:
                    eval_date = fecha_min
                    while not agendado:
                        # Busca el Sábado (5) o Domingo (6)
                        if eval_date.weekday() in [5, 6]: 
                            for hora in horarios_bloque:
                                if is_slot_available(eval_date, hora):
                                    book_slot(eval_date, hora)
                                    fecha_agendada, hora_agendada = eval_date, hora
                                    agendado = True
                                    break
                        eval_date += datetime.timedelta(days=1)
                        
                # Guardado y propagación de cronología
                partido.fecha = fecha_agendada.strftime('%Y-%m-%d')
                partido.hora = hora_agendada
                partido.save()
                
                if partido.partido_siguiente:
                    curr_min = fecha_minima_por_partido.get(partido.partido_siguiente.id_partido, hoy)
                    # El partido siguiente debe jugarse al menos un día después de este
                    fecha_minima_por_partido[partido.partido_siguiente.id_partido] = max(curr_min, fecha_agendada + datetime.timedelta(days=1))

        return Response({"status": f"Cuadro y agendas estructuradas con éxito para {num_jugadores} competidores."}, status=status.HTTP_201_CREATED)
        
    @action(detail=True, methods = ['post'])
    def inscribir(self, request, pk=None):
        torneo = self.get_object()
        user = request.user
        # Validar que el torneo este en estado "Programado"
        if torneo.estado_torneo != 'Programado':
            return Response({"detail": "No puedes inscribirte en un torneo que ya ha comenzado o finalizado."}, status=status.HTTP_400_BAD_REQUEST) 

        #validar la restriccion de Rama
        perfil = getattr(user, 'perfil', None)
        sexo_usuario = perfil.sexo_usuario if perfil else None
        rama_torneo = torneo.rama_torneo

        if rama_torneo != 'Mixto' and sexo_usuario:
            #Normalizar para comparar de forma segura
            es_masculino = sexo_usuario.lower() in ['masculino', 'hombre', 'm','varonil']
            es_femenino = sexo_usuario.lower() in ['femenino', 'mujer','femenil', 'f']

            if rama_torneo == 'Varonil' and not es_masculino:
                return Response({"detail": "Este torneo es solo para jugadores varoniles."}, status=status.HTTP_400_BAD_REQUEST)
            if rama_torneo == 'Femenil' and not es_femenino:
                return Response({"detail": "Este torneo es solo para jugadoras femeniles."}, status=status.HTTP_400_BAD_REQUEST)

        
        # Extraemos la matriz enviada desde el frontend
        matriz_disponibilidad = request.data.get('matriz_disponibilidad')
        
        # Creamos la inscripción (el numero_siembra se queda en blanco para que lo llene el admin)
        inscripcion, created = Inscripcion.objects.get_or_create(
            torneo=torneo,
            jugador=user,
            defaults={'matriz_disponibilidad': matriz_disponibilidad}
        )
        
        if not created:
            return Response({"detail": "Ya estás inscrito en este torneo."}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({"detail": "Inscripción exitosa."}, status=status.HTTP_201_CREATED)

    # Cancelar / dar de baja inscripcion
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
        inscripciones = torneo.inscripciones.all() # Usa el related_name que definiste en tu modelo
        serializer = InscripcionesSerializer(inscripciones, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def mis_inscripciones(self, request):
        # Filtramos los torneos donde el usuario actual tenga una inscripción
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
        """
        Intercepta el guardado del resultado para cerrar el partido 
        y empujar al ganador a la siguiente posición disponible del árbol.
        """
        resultado = serializer.save()
        partido = resultado.partido
        ganador = resultado.ganador

        #Cierra el partido y marca como finalizado
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

        es_partido_final = False
        
        if not partido.partido_siguiente:
            es_partido_final = True
        elif hasattr(partido, 'fase') and partido.fase and 'final' in str(partido.fase).lower():
            es_partido_final = True

        # Si detectamos que es la final, cerramos el torneo de forma directa
        if es_partido_final:
            torneo = getattr(partido, 'torneo', None)
            
            # Si el partido no tiene el campo .torneo directo, lo buscamos por relaciones comunes
            if not torneo and hasattr(partido, 'categoria'):
                pass # por si acaso
            
            if torneo:
                torneo.estado_torneo = 'Finalizado'
                torneo.save()
                print(f"✅ ¡ÉXITO! Torneo '{torneo.nombre_torneo}' actualizado automáticamente a 'Finalizado'.")
            else:
                # Búsqueda de emergencia del torneo asociado a este partido
                from .models import Torneo
                # Si el partido tiene una llave foránea indirecta, la localizamos:
                print("⚠️ Advertencia: No se encontró la relación directa .torneo en el objeto partido.")