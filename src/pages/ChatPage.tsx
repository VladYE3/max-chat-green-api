import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../store/authSlice';
import { useNotifications } from '../hooks/useNotifications';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import NewChatModal from '../components/NewChatModal';

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, credentials } = useAppSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useNotifications();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !credentials) return null;

  return (
    <div className="chat-page">
      <Sidebar onNewChat={() => setIsModalOpen(true)} />
      <div className="chat-main">
        <div className="topbar">
          <span className="topbar-account">idInstance: {credentials.idInstance}</span>
          <button
            className="button-secondary"
            onClick={() => {
              dispatch(logout());
              navigate('/login', { replace: true });
            }}
          >
            Выйти
          </button>
        </div>
        <ChatWindow />
      </div>
      {isModalOpen && <NewChatModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
