import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class StandardPasswordValidator:
    def validate(self, password, user=None):
        if not re.findall('[A-Z]', password):
            raise ValidationError(
                _("La contraseña debe contener al menos una letra mayúscula."),
                code='password_no_upper',
            )
        if not re.findall('[a-z]', password):
            raise ValidationError(
                _("La contraseña debe contener al menos una letra minúscula."),
                code='password_no_lower',
            )
        if not re.findall('\d', password):
            raise ValidationError(
                _("La contraseña debe contener al menos un número."),
                code='password_no_number',
            )
        if not re.findall('[^A-Za-z0-9]', password):
            raise ValidationError(
                _("La contraseña debe contener al menos un carácter especial (ej. @, #, $, %, !)."),
                code='password_no_symbol',
            )

    def get_help_text(self):
        return _("Tu contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.")