import type { ChatMessage } from '../types/chat';

function formatTime(timestamp: number): string {
  return new Date(timestamp * (timestamp < 1e12 ? 1000 : 1)).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <div className={`message-row ${message.direction}`}>
      <div className="message-bubble">
        <span className="message-text">{message.text}</span>
        <span className="message-meta">
          {formatTime(message.timestamp)}
          {message.direction === 'outgoing' && (
            <span className={`message-status ${message.status}`}>
              {message.status === 'sending' ? '⏳' : message.status === 'sent' ? '✓✓' : '⚠️'}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
