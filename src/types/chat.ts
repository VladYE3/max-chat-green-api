export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  direction: 'incoming' | 'outgoing';
  timestamp: number;
  status: MessageStatus;
}

export interface Chat {
  chatId: string;
  phone: string;
  title: string;
  messages: ChatMessage[];
  unreadCount: number;
}

export function phoneToChatId(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@c.us`;
}
