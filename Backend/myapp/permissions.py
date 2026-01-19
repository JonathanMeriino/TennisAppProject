from rest_framework import permissions

class IsAdminUserCustom(permissions.BasePermission):
    """
    Permite el acceso solo si el usuario tiene el rol 'Administrador'
    o si es un Superusuario de Django.
    """
    def has_permission(self, request, view):
        # 1. Validación básica: ¿Está logueado?
        if not request.user or not request.user.is_authenticated:
            return False

        # 2. Puerta trasera para el Desarrollador (Superuser)
        # Si eres superuser, pasas automáticamente sin revisar perfil.
        if request.user.is_superuser:
            return True

        # 3. Validación de Perfil (Manejo de errores defensivo)
        # Intentamos acceder al perfil. Si no existe, capturamos el error para que no truene.
        if not hasattr(request.user, 'perfil'):
            return False

        # 4. Validación del Rol
        # Accedemos a user -> perfil -> idRol -> nombreRol
        perfil = request.user.perfil
        if perfil.idRol and perfil.idRol.nombreRol == 'Administrador':
            return True

        return False


class IsJugadorUserCustom(permissions.BasePermission):
    """
    Permite el acceso a Jugadores y Admins (El admin suele poder ver lo del jugador).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        if not hasattr(request.user, 'perfil'):
            return False

        perfil = request.user.perfil
        # Asumimos que el Admin también puede ver cosas de jugadores
        if perfil.idRol and perfil.idRol.nombreRol in ['Jugador', 'Administrador']:
            return True

        return False