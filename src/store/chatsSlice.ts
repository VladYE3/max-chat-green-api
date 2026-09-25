import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Chat, ChatMessage } from '../types/chat';
import { logout } from './authSlice';

export interface ChatsState {
  chats: Chat[];
  activeChatId: string | null;
  /**
   * В MAX входящие уведомления приходят с внутренним ID пользователя
   * (например "442946735@c.us"), а не с номером телефона. Здесь хранится
   * соответствие: ID пользователя MAX -> chatId чата (номер@c.us).
   */
  aliases: Record<string, string>;
}

const initialState: ChatsState = {
  chats: [],
  activeChatId: null,
  aliases: {},
};

interface AddMessagePayload {
  message: ChatMessage;
  senderName?: string;
}

function upsertMessage(chats: Chat[], { message, senderName }: AddMessagePayload): Chat[] {
  const index = chats.findIndex((chat) => chat.chatId === message.chatId);
  if (index === -1) {
    const title = senderName ?? message.chatId.replace('@c.us', '');
    const chat: Chat = {
      chatId: message.chatId,
      phone: message.chatId.replace('@c.us', ''),
      title,
      messages: [message],
      unreadCount: message.direction === 'incoming' ? 1 : 0,
    };
    return [...chats, chat];
  }
  const chat = chats[index];
  if (chat.messages.some((existing) => existing.id === message.id)) {
    return chats;
  }
  const updated: Chat = {
    ...chat,
    messages: [...chat.messages, message],
    unreadCount: message.direction === 'incoming' ? chat.unreadCount + 1 : chat.unreadCount,
  };
  const next = [...chats];
  next[index] = updated;
  return next;
}

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    addChat(state, action: PayloadAction<{ chatId: string; phone: string; title: string }>) {
      const { chatId, phone, title } = action.payload;
      if (!state.chats.some((chat) => chat.chatId === chatId)) {
        state.chats.push({ chatId, phone, title, messages: [], unreadCount: 0 });
      }
      state.activeChatId = chatId;
    },
    setActiveChat(state, action: PayloadAction<string>) {
      state.activeChatId = action.payload;
      const chat = state.chats.find((item) => item.chatId === action.payload);
      if (chat) chat.unreadCount = 0;
    },
    addMessage(state, action: PayloadAction<AddMessagePayload>) {
      state.chats = upsertMessage(state.chats, action.payload);
    },
    addAlias(state, action: PayloadAction<{ alias: string; chatId: string }>) {
      state.aliases[action.payload.alias] = action.payload.chatId;
    },
    markMessageSent(
      state,
      action: PayloadAction<{ chatId: string; localId: string; idMessage: string }>,
    ) {
      const chat = state.chats.find((item) => item.chatId === action.payload.chatId);
      const message = chat?.messages.find((item) => item.id === action.payload.localId);
      if (message) {
        message.id = action.payload.idMessage;
        message.status = 'sent';
      }
    },
    markMessageFailed(state, action: PayloadAction<{ chatId: string; localId: string }>) {
      const chat = state.chats.find((item) => item.chatId === action.payload.chatId);
      const message = chat?.messages.find((item) => item.id === action.payload.localId);
      if (message) message.status = 'failed';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const { addChat, setActiveChat, addMessage, addAlias, markMessageSent, markMessageFailed } =
  chatsSlice.actions;
export default chatsSlice.reducer;
