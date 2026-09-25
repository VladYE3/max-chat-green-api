import type {
  GreenApiCredentials,
  InstanceSettings,
  Notification,
  SendMessageResponse,
} from '../types/api';

const API_URL = 'https://api.green-api.com';

export class GreenApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'GreenApiError';
    this.status = status;
  }
}

function baseUrl({ idInstance }: GreenApiCredentials): string {
  return `${API_URL}/waInstance${idInstance}`;
}

function token(creds: GreenApiCredentials): string {
  return creds.apiTokenInstance;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    throw new GreenApiError(0, 'Не удалось подключиться к серверу GREEN-API. Проверьте подключение к интернету.');
  }

  if (!response.ok) {
    let detail = '';
    try {
      const data = await response.json();
      detail = typeof data?.message === 'string' ? `: ${data.message}` : '';
    } catch {
      // тело ответа не является JSON — оставляем detail пустым
    }
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      throw new GreenApiError(response.status, `Неверные учетные данные инстанса (idInstance / apiTokenInstance)${detail}`);
    }
    throw new GreenApiError(response.status, `Ошибка API GREEN-API (${response.status})${detail}`);
  }

  return (await response.json()) as T;
}

export function getSettings(creds: GreenApiCredentials): Promise<InstanceSettings> {
  return request<InstanceSettings>(`${baseUrl(creds)}/getSettings/${token(creds)}`);
}

export function sendMessage(
  creds: GreenApiCredentials,
  chatId: string,
  message: string,
): Promise<SendMessageResponse> {
  return request<SendMessageResponse>(`${baseUrl(creds)}/sendMessage/${token(creds)}`, {
    method: 'POST',
    body: JSON.stringify({ chatId, message }),
  });
}

export function receiveNotification(creds: GreenApiCredentials): Promise<Notification | null> {
  return request<Notification | null>(`${baseUrl(creds)}/receiveNotification/${token(creds)}`);
}

export function deleteNotification(
  creds: GreenApiCredentials,
  receiptId: number,
): Promise<boolean> {
  return request<boolean>(`${baseUrl(creds)}/deleteNotification/${token(creds)}/${receiptId}`, {
    method: 'DELETE',
  });
}
