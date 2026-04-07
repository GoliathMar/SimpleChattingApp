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
        fields = ['id', 'room', 'sender_id', 'text', 'file', 'file_name', 'file_mime_type', 'timestamp']
        read_only_fields = ['room', 'sender_id', 'timestamp']

    def create(self, validated_data):
        """Automatycznie pobierz metadane pliku podczas tworzenia."""
        file_obj = validated_data.get('file')
        if file_obj:
            # Przechowaj oryginalną nazwę pliku
            validated_data['file_name'] = file_obj.name
            # Spróbuj ustawić MIME type
            mime_type = getattr(file_obj, 'content_type', None)
            if mime_type:
                validated_data['file_mime_type'] = mime_type
            else:
                # Fallback: zgadnij MIME type z rozszerzenia
                import mimetypes
                guessed_type, _ = mimetypes.guess_type(file_obj.name)
                validated_data['file_mime_type'] = guessed_type or 'application/octet-stream'
        return super().create(validated_data)


class RoomSerializer(serializers.ModelSerializer):
    participants = RoomParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'name', 'is_direct_message', 'created_at', 'participants']