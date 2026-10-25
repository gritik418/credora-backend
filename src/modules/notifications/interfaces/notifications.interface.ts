import { NotificationType } from 'generated/prisma/enums';

export interface CreateNotificationPayload {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  notificationActorId: string;
  entity?: { id: string; type: string };
  actionUrl?: string;
  expiresAt?: Date;
}
