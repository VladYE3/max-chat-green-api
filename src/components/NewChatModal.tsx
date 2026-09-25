import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addChat } from '../store/chatsSlice';
import { phoneToChatId } from '../types/chat';

export default function NewChatModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chats.chats);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      setError('Введите номер телефона в международном формате, например 79991234567');
      return;
    }
    const chatId = phoneToChatId(phone);
    if (chats.some((chat) => chat.chatId === chatId)) {
      setError('Чат с этим номером уже существует');
      return;
    }
    dispatch(addChat({ chatId, phone: digits, title: `+${digits}` }));
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h2>Новый чат</h2>
        <p>Введите номер телефона получателя в международном формате</p>
        <form onSubmit={handleSubmit}>
          <input
            type="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              setError(null);
            }}
            placeholder="+7 (999) 123-45-67"
            autoFocus
          />
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="button-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit">Создать чат</button>
          </div>
        </form>
      </div>
    </div>
  );
}
