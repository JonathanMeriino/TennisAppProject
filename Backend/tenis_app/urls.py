"""
URL configuration for tenis_app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from myapp import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView    

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/",include('myapp.urls')),
    #Swagger URLs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='api-docs'),
    
    # Ruta para iniciar sesión (Login)
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Ruta para obtener un nuevo Access Token usando el Refresh Token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('prueba/', views.prueba_conexion, name='prueba-conexion')
]
