# chat-service/ChatApp/models.py
import uuid
from django.db import models


class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, blank=True, null=True)
    is_direct_message = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class RoomParticipant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="participants")
    user_id = models.UUIDField(db_index=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("room", "user_id")


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, related_name='messages', on_delete=models.CASCADE)
    sender_id = models.UUIDField(db_index=True)

    text = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='chat_media/', blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True, null=True)  # Original filename
    file_mime_type = models.CharField(max_length=100, blank=True, null=True)  # MIME type (e.g. application/pdf)

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']