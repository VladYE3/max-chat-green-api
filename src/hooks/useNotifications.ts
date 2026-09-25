import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { deleteNotification, receiveNotification } from '../services/greenApi';
import type { Notification } from '../types/api';
import { processIncomingMessage } from '../store/chatThunks';

const POLL_DELAY_MS = 2500;

function extractText(notification: Notification): string | null {
  const data = notification.body.messageData;
  if (!data) return null;
  if (data.textMessageData?.textMessage) return data.textMessageData.textMessage;
  if (data.extendedTextMessageData?.text) return data.extendedTextMessageData.text;
  return null;
}

export function useNotifications() {
  const dispatch = useAppDispatch();
  const credentials = useAppSelector((state) => state.auth.credentials);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !credentials) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (cancelled) return;
      try {
        const notification = await receiveNotification(credentials);
        if (cancelled) return;
        if (notification) {
          const { body, receiptId } = notification;
          if (
            body.typeWebhook === 'incomingMessageReceived' &&
            body.senderData?.chatId &&
            body.idMessage
          ) {
            const text = extractText(notification);
            if (text !== null) {
              dispatch(
                processIncomingMessage({
                  message: {
                    id: body.idMessage,
                    chatId: body.senderData.chatId,
                    text,
                    direction: 'incoming',
                    timestamp: body.timestamp,
                    status: 'sent',
                  },
                  senderName:
                    body.senderData.senderName ?? body.senderData.chatName,
                }),
              );
            }
          }
          await deleteNotification(credentials, receiptId);
        }
      } catch {
        // сетевые ошибки не прерывают цикл поллинга
      }
      if (!cancelled) timer = setTimeout(poll, POLL_DELAY_MS);
    };

    void poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isAuthenticated, credentials, dispatch]);
}
