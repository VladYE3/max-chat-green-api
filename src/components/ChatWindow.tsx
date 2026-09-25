import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { sendMessage } from '../services/greenApi';
import { addMessage, markMessageFailed, markMessageSent } from '../store/chatsSlice';
import MessageBubble from './MessageBubble';

export default function ChatWindow() {
  const dispatch = useAppDispatch();
  const credentials = useAppSelector((state) => state.auth.credentials);
  const activeChatId = useAppSelector((state) => state.chats.activeChatId);
  const chat = useAppSelector((state) =>
    state.chats.chats.find((item) => item.chatId === state.chats.activeChatId),
  );
  const [text, setText] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages.length]);

  if (!activeChatId || !chat) {
    return (
      <main className="chat-window chat-window-empty">
        <div>
          <div className="empty-logo">MAX</div>
          <p>Выберите чат слева или создайте новый</p>
        </div>
      </main>
    );
  }

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !credentials) return;
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    dispatch(
      addMessage({
        message: {
          id: localId,
          chatId: activeChatId,
          text: trimmed,
          direction: 'outgoing',
          timestamp: Math.floor(Date.now() / 1000),
          status: 'sending',
        },
      }),
    );
    setText('');
    setSendError(null);
    sendMessage(credentials, activeChatId, trimmed)
      .then((response) => {
        dispatch(markMessageSent({ chatId: activeChatId, localId, idMessage: response.idMessage }));
      })
      .catch((error: unknown) => {
        dispatch(markMessageFailed({ chatId: activeChatId, localId }));
        setSendError(error instanceof Error ? error.message : 'Не удалось отправить сообщение');
      });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleSend();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="chat-window">
      <header className="chat-header">
        <span className="chat-avatar">{chat.title.replace('+', '').slice(-2)}</span>
        <div className="chat-header-info">
          <span className="chat-header-title">{chat.title}</span>
          <span className="chat-header-subtitle">через GREEN-API · MAX</span>
        </div>
      </header>
      <div className="messages">
        {chat.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {sendError && <div className="send-error">{sendError}</div>}
      <form className="message-input" onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение…"
          rows={1}
        />
        <button type="submit" disabled={!text.trim()} title="Отправить">
          ➤
        </button>
      </form>
    </main>
  );
}
