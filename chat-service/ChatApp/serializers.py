# chat-service/ChatApp/serializers.py
from rest_framework import serializers
from .models import Room, RoomParticipant, Message


class RoomParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomParticipant
        fields = ['id', 'user_id', 'joined_at']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'room', 'sender_id', 'text', 'file', 'timestamp']
        read_only_fields = ['room', 'sender_id', 'timestamp']


class RoomSerializer(serializers.ModelSerializer):
    participants = RoomParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'name', 'is_direct_message', 'created_at', 'participants']