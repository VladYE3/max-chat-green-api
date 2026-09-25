import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setActiveChat } from '../store/chatsSlice';
import type { Chat } from '../types/chat';

function lastMessagePreview(chat: Chat): string {
  const last = chat.messages[chat.messages.length - 1];
  if (!last) return 'Нет сообщений';
  const prefix = last.direction === 'outgoing' ? 'Вы: ' : '';
  return `${prefix}${last.text}`;
}

export default function Sidebar({ onNewChat }: { onNewChat: () => void }) {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chats.chats);
  const activeChatId = useAppSelector((state) => state.chats.activeChatId);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Чаты</span>
        <button className="new-chat-button" onClick={onNewChat} title="Новый чат">
          ✎ Новый чат
        </button>
      </div>
      <div className="chat-list">
        {chats.length === 0 && (
          <div className="chat-list-empty">
            Чатов пока нет.
            <br />
            Нажмите «Новый чат», чтобы начать переписку.
          </div>
        )}
        {chats.map((chat) => (
          <button
            key={chat.chatId}
            className={`chat-list-item ${chat.chatId === activeChatId ? 'active' : ''}`}
            onClick={() => dispatch(setActiveChat(chat.chatId))}
          >
            <span className="chat-avatar">{chat.title.replace('+', '').slice(-2)}</span>
            <span className="chat-list-text">
              <span className="chat-list-name">{chat.title}</span>
              <span className="chat-list-preview">{lastMessagePreview(chat)}</span>
            </span>
            {chat.unreadCount > 0 && (
              <span className="chat-unread">{chat.unreadCount}</span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
