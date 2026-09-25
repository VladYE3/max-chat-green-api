export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface InstanceSettings {
  webhookUrl: string;
  outgoingWebhook: string;
  stateWebhook: string;
  incomingWebhook: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface TextMessageData {
  typeMessage: 'textMessage';
  textMessage: string;
}

export interface ExtendedTextMessageData {
  typeMessage: 'extendedTextMessage';
  text: string;
}

export interface MessageData {
  typeMessage: string;
  textMessageData?: TextMessageData;
  extendedTextMessageData?: ExtendedTextMessageData;
}

export interface SenderData {
  chatId: string;
  sender: string;
  chatName?: string;
  senderName?: string;
}

export interface NotificationBody {
  typeWebhook: string;
  instanceData?: {
    idInstance: number;
  };
  timestamp: number;
  idMessage?: string;
  senderData?: SenderData;
  messageData?: MessageData;
}

export interface Notification {
  receiptId: number;
  body: NotificationBody;
}
