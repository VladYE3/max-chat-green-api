import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import type { ChatMessage } from '../types/chat';
import { addAlias, addMessage } from './chatsSlice';

/**
 * Входящие уведомления MAX содержат внутренний ID пользователя, а не номер
 * телефона. Сопоставляем его с существующим чатом:
 * 1. точное совпадение chatId;
 * 2. ранее сохранённый alias;
 * 3. единственный чат, куда мы писали, но откуда ещё не получали ответ;
 * 4. иначе — сообщение уйдёт в новый чат с именем отправителя.
 */
export const processIncomingMessage = createAsyncThunk<
  void,
  { message: ChatMessage; senderName?: string },
  { state: RootState }
>('chats/processIncomingMessage', async ({ message, senderName }, { getState, dispatch }) => {
  const { chats, aliases } = getState().chats;
  let chatId = message.chatId;

  if (!chats.some((chat) => chat.chatId === chatId)) {
    const known = aliases[chatId];
    if (known) {
      chatId = known;
    } else {
      const candidates = chats.filter(
        (chat) =>
          chat.messages.some((item) => item.direction === 'outgoing') &&
          !chat.messages.some((item) => item.direction === 'incoming'),
      );
      if (candidates.length === 1) {
        const target = candidates[0];
        dispatch(addAlias({ alias: message.chatId, chatId: target.chatId }));
        chatId = target.chatId;
      }
    }
  }

  dispatch(addMessage({ message: { ...message, chatId }, senderName }));
});
