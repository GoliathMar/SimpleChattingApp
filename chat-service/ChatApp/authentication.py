from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class MicroserviceUser:
    """Wirtualny użytkownik, który istnieje tylko po to, by nosić ID z tokena."""

    def __init__(self, user_id):
        self.id = user_id
        self.is_authenticated = True


class MicroserviceJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        """Nadpisujemy domyślne zachowanie, by NIE szukać w lokalnej bazie bazy."""
        user_id = validated_token.get('user_id')

        if not user_id:
            raise AuthenticationFailed('Token nie zawiera ID użytkownika.')

        return MicroserviceUser(user_id)