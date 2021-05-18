"""
ASGI config for video_chat project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

import django
# from django.core.asgi import get_asgi_application
from channels.routing import get_default_application

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

from chat_page.routing import ws_urlpatterns


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'video_chat.settings')
django.setup()
# application = get_asgi_application()

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(URLRouter(ws_urlpatterns)),
})
