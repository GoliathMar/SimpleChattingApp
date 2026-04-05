from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.UserRoomsView.as_view(), name='user-rooms'),

    path('rooms/<uuid:room_id>/messages/', views.RoomMessagesView.as_view(), name='room-messages'),

    path('messages/<uuid:message_id>/download/', views.MessageFileDownloadView.as_view(), name='message-download'),
]