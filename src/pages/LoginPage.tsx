import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearAuthError, login } from '../store/authSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/chat', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setValidationError('Заполните оба поля: idInstance и apiTokenInstance');
      return;
    }
    setValidationError(null);
    dispatch(clearAuthError());
    dispatch(login({ idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim() }));
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">MAX</div>
        <h1>Вход в чат</h1>
        <p className="login-subtitle">
          Введите учетные данные инстанса GREEN-API
        </p>
        <label>
          idInstance
          <input
            type="text"
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
            placeholder="Например: 1101000001"
            autoComplete="off"
          />
        </label>
        <label>
          apiTokenInstance
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(event) => setApiTokenInstance(event.target.value)}
            placeholder="Токен из личного кабинета GREEN-API"
            autoComplete="off"
          />
        </label>
        {(validationError ?? error) && (
          <div className="form-error">{validationError ?? error}</div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Проверка…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
