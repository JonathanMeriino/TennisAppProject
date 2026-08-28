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
            }
        })
    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Perfil actualizado correctamente"})
        return Response(serializer.errors, status=400)

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

    @action(detail=True, methods=['post'], url_path='generar-bracket')
    def generar_bracket(self, request, pk=None):
        """
        Algoritmo para construir el cuadro de eliminación directa
        Con distribución simetrica de siembras y byes automáticos. 
        """
        torneo = self.get_object()
        
        # 1. Filtrar solo inscripciones aprobadas y ordenadas por siembra (seed)
        inscripciones = list(Inscripcion.objects.filter(torneo=torneo, estado_inscripcion='Aceptada').order_by('numero_siembra'))
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

        # 3. Distribución simétrica de jugadores y Byes en los partidos de la Ronda 1
        def generar_orden_siembra(tam):
            """Genera la secuencia simétrica de enfrentamientos para una potencia de 2"""
            if tam == 1:
                return [1]
            prev = generar_orden_siembra(tam // 2)
            res = []
            for item in prev:
                res.append(item)
                res.append(tam + 1 - item)
            return res

        slots_jugadores = [None] * potencia_superior
        inscripciones_ordenadas = list(inscripciones)
        patron_indices = generar_orden_siembra(potencia_superior)
        
        # Asignamos los jugadores reales a las posiciones correspondientes del patrón simétrico
        for idx, jugador_inscripcion in enumerate(inscripciones_ordenadas):
            if idx < potencia_superior:
                posicion_teorica = patron_indices.index(idx + 1)
                slots_jugadores[posicion_teorica] = jugador_inscripcion

        partidos_primera_ronda = partidos_por_ronda[1]
        
        # Rellenamos los partidos de la primera ronda de 2 en 2 slots del cuadro ideal
        for i, part in enumerate(partidos_primera_ronda):
            jugadorA = slots_jugadores[i * 2]
            jugadorB = slots_jugadores[(i * 2) + 1]
            
            part.jugador1 = jugadorA  # Si es None, representa un Bye técnico
            part.jugador2 = jugadorB  # Si es None, representa un Bye técnico
            part.save()

        return Response({
            "status": f"Cuadro de eliminación directa generado con éxito.",
            "jugadores_totales": num_jugadores,
            "capacidad_ideal": potencia_superior,
            "byes_asignados": potencia_superior - num_jugadores
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods = ['post'])
    def inscribir(self, request, pk=None):
        torneo = self.get_object()
        user = request.user
        
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
