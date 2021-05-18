from django.urls import path
from . import views

urlpatterns = [
    path('', views.chat_page, name='chat-page'),
    path('some_number', views.chat_page, name='chat-page'),
]