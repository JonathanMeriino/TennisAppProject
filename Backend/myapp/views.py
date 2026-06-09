import math
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializer import (RolesSerializer, UserSerializer, TorneoSerializer, InscripcionesSerializer, PartidoSerializer,ResultadoSerializer )
from .models import (
    Roles, User, Torneo,
    Inscripcion, Partido, Resultado
)
from .permissions import IsAdminUserCustom

# Create your views here.


class RolesViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolesSerializer
    

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TorneoViewSet(viewsets.ModelViewSet):
    queryset = Torneo.objects.all()
    serializer_class = TorneoSerializer

    @action(detail=True, methods=['post'], url_path='generar-bracket')
    def generar_bracket(self, request, pk=None):
        """
        Algoritmo para construir el cuadro matemático de eliminación directa.
        Borra llaves anteriores y genera la estructura de rondas necesarias.
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
        
        # Limpieza defensiva de partidos previos
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

        # 3. Sembrar a los jugadores reales en los partidos de la Ronda 1
        partidos_primera_ronda = partidos_por_ronda[1]
        idx = 0
        for part in list(partidos_primera_ronda):
            if idx < num_jugadores:
                part.jugador1 = inscripciones[idx]
                idx += 1
            if idx < num_jugadores:
                part.jugador2 = inscripciones[idx]
                idx += 1
            part.save()

        return Response({"status": f"Cuadro de eliminación directa creado con éxito para {num_jugadores} competidores."}, status=status.HTTP_201_CREATED)


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
