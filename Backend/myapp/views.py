import math
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
        """
        Algoritmo para construir el cuadro de eliminación directa
        Con distribución simetrica de siembras y byes automáticos. 
        """
        torneo = self.get_object()
        
        # 1. Filtrar solo inscripciones aprobadas y ordenadas por siembra (seed)
        inscripciones = list(Inscripcion.objects.filter(torneo=torneo).order_by('numero_siembra'))
        num_jugadores = len(inscripciones)
        
        if num_jugadores < 2:
            return Response({"error": "Se requieren mínimo 2 jugadores aceptados para estructurar un bracket."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calcular la potencia de 2 inmediata superior para balancear el cuadro (2, 4, 8, 16, 32...)
        potencia_superior = 2 ** math.ceil(math.log2(num_jugadores))
        total_rondas = int(math.log2(potencia_superior))
        
        # Limpieza de partidos previos
        Partido.objects.filter(torneo=torneo).delete()

        def definir_nombre_fase(ronda_actual, rondas_totales):
            if ronda_actual == rondas_totales: return "Final"
            if ronda_actual == rondas_totales - 1: return "Semifinal"
            if ronda_actual == rondas_totales - 2: return "Cuartos de Final"
            return f"Ronda de {2 ** (rondas_totales - ronda_actual + 1)}"

        partidos_por_ronda = {}
        
        # 2. Construcción del árbol al revés (de la Final a la Ronda 1) para enlazar 'partido_siguiente'
        for r in range(total_rondas, 0, -1):
            fase_nombre = definir_nombre_fase(r, total_rondas)
            num_partidos_ronda = potencia_superior // (2 ** r)
            creados_en_ronda = []
            
            for i in range(num_partidos_ronda):
                p_siguiente = None
                # Vincular con el partido de la ronda posterior que ya fue guardado en el diccionario
                if r < total_rondas:
                    p_siguiente = partidos_por_ronda[r + 1][i // 2]
                
                partido = Partido.objects.create(
                    torneo=torneo,
                    fase=fase_nombre,
                    partido_siguiente=p_siguiente
                )
                creados_en_ronda.append(partido)
            
            partidos_por_ronda[r] = creados_en_ronda

       # 3. Estructura estándar: Todos los partidos se generan en la Ronda de 16
        partidos_primera_ronda = partidos_por_ronda[1]
        num_byes = potencia_superior - num_jugadores  # 16 - 12 = 4 byes

        # Limpiamos todos los partidos por seguridad
        for ronda in partidos_por_ronda.values():
            for p in ronda:
                p.jugador1 = None
                p.jugador2 = None
                p.estado = 'Pendiente'
                p.save()

        # Ordenar jugadores por siembra
        con_siembra = sorted([ins for ins in inscripciones if ins.numero_siembra is not None], key=lambda x: x.numero_siembra)
        sin_siembra = [ins for ins in inscripciones if ins.numero_siembra is None]
        todos_ordenados = con_siembra + sin_siembra

        # Dividimos: 4 jugadores para los Byes y 8 jugadores para los 4 enfrentamientos reales
        jugadores_con_bye = todos_ordenados[:num_byes]           # 4 jugadores
        jugadores_en_enfrentamiento = todos_ordenados[num_byes:] # 8 jugadores

        # Creamos los primeros 4 partidos con un jugador real y un Bye (None) en la Ronda de 16
        for i in range(num_byes):
            partido = partidos_primera_ronda[i]
            partido.jugador1 = jugadores_con_bye[i]
            partido.jugador2 = None  # Espacio vacío (Bye)
            partido.save()

        # Creamos los siguientes 4 partidos con los 8 jugadores que sí se enfrentan entre sí
        indice_partido = num_byes
        for i in range(0, len(jugadores_en_enfrentamiento), 2):
            if indice_partido < len(partidos_primera_ronda):
                partido = partidos_primera_ronda[indice_partido]
                partido.jugador1 = jugadores_en_enfrentamiento[i]
                partido.jugador2 = jugadores_en_enfrentamiento[i+1] if i+1 < len(jugadores_en_enfrentamiento) else None
                partido.save()
                indice_partido += 1

        # 4. Propagación automática de Byes a la siguiente ronda (Cuartos de Final)
        for partido in partidos_primera_ronda:
            if (partido.jugador1 is not None and partido.jugador2 is None) or \
               (partido.jugador1 is None and partido.jugador2 is not None):
                
                jugador_avanza = partido.jugador1 if partido.jugador1 is not None else partido.jugador2
                
                partido.estado = 'Finalizado'
                partido.save()

                if partido.partido_siguiente:
                    sig = partido.partido_siguiente
                    if sig.jugador1 is None:
                        sig.jugador1 = jugador_avanza
                    elif sig.jugador2 is None:
                        sig.jugador2 = jugador_avanza
                    sig.save()
                    
        return Response({"status": f"Cuadro de eliminación directa creado con éxito para {num_jugadores} competidores."}, status=status.HTTP_201_CREATED)

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
        partidos = torneo.partidos.all()  
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