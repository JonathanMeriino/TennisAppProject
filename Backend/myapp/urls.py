from django.urls import path, include
from rest_framework import routers
from myapp import views

#Inicializar el router
router = routers.DefaultRouter()

#Registrar cada view set con su URL base (endpoint)


router.register(r'roles', views.RolesViewSet)
router.register(r'usuario',views.UsuarioViewSet)
router.register(r'torneo', views.TorneoViewSet)
router.register(r'inscripciones',views.InscripcionViewSet, basename='inscripciones') # Le damos un basename porque no hay un queryset definido en el viewset
router.register(r'partido', views.PartidoViewSet)


#Incluye todas las rutas generadas por el Router
urlpatterns = [
    path('',include(router.urls)),
    path('auth/me',views.GetUserViewSet.as_view({"get": "get"}), name='get_user'),
]