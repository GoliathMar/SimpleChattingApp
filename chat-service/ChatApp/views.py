# chat-service/ChatApp/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse, Http404
from .models import Room, RoomParticipant, Message
from .serializers import RoomSerializer, MessageSerializer

class UserRoomsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        rooms = Room.objects.filter(participants__user_id=user_id)
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            room = serializer.save()
            RoomParticipant.objects.create(room=room, user_id=request.user.id)
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoomMessagesView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, room_id):
        if not RoomParticipant.objects.filter(room_id=room_id, user_id=request.user.id).exists():
            return Response({"error": "NO ACCESS"}, status=status.HTTP_403_FORBIDDEN)

        messages = Message.objects.filter(room_id=room_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, room_id):
        if not RoomParticipant.objects.filter(room_id=room_id, user_id=request.user.id).exists():
            return Response({"error": "NO ACCESS"}, status=status.HTTP_403_FORBIDDEN)

        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(room_id=room_id, sender_id=request.user.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageFileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id)
        except Message.DoesNotExist:
            raise Http404

        if not RoomParticipant.objects.filter(room_id=message.room_id, user_id=request.user.id).exists():
            return Response({"error": "NO ACCESS"}, status=status.HTTP_403_FORBIDDEN)

        if not message.file:
            return Response({"error": "No file found"}, status=status.HTTP_404_NOT_FOUND)

        return FileResponse(message.file.open('rb'), as_attachment=True)