from django.urls import path, include
from rest_framework import routers
from myapp import views

#Inicializar el router
router = routers.DefaultRouter()

#Registrar cada view set con su URL base (endpoint)

router.register(r'categoria',views.CategoriaViewSet) # r especificar la base categorias
router.register(r'roles', views.RolesViewSet)
router.register(r'formato', views.FormatoViewSet)
router.register(r'usuario',views.UsuarioViewSet)
router.register(r'torneo', views.TorneoViewSet)
router.register(r'cuadro', views.CuadroViewSet)
router.register(r'gruposCategoria', views.GruposCategoriaViewSet)
router.register(r'inscripciones',views.InscripcionesViewSet)
router.register(r'disponibilidad', views.DisponibilidadViweSet)
router.register(r'miembrosGrupo',views.MiembrosGrupoViewSet)
router.register(r'posicionesGRupo', views.PosicionesGrupoViewSet)
router.register(r'partido', views.PartidoViewSet)
router.register(r'sets', views.SetsViewSet)


#Incluye todas las rutas generadas por el Router
urlpatterns = [
    path('',include(router.urls))
]