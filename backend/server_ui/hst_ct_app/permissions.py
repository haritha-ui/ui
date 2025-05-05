
from rest_framework.permissions import IsAuthenticated

class CustomIsAuthenticated(IsAuthenticated):

    def has_permission(self, request, view):
        # Since the preflight 'OPTIONS' request cant be controlled from browser
        # which cant have Authorization custom headers and is treated as a non-
        # authentic user request making any subsequent requests too as unauthorized
        # By passing options and allowing other requests
        if request.method == 'OPTIONS':
            return True
        elif not (request.user and request.user.is_authenticated):
            print(f'User {request.user}  Authenticated:{request.user.is_authenticated}')
            return False
        else:
            return super(IsAuthenticated, self).has_permission(request, view)

        # if not "HTTP_AUTHORIZATION" in request.META:
        #     print('Request "Authorization" heder not present')
        #     return False

        