# MAX Chat — тестовое задание «Фронтенд разработчик React»

Пользовательский интерфейс чата мессенджера MAX (внешний вид по прототипу [web.max.ru](https://web.max.ru)) для отправки и получения текстовых сообщений через сервис [GREEN-API](https://green-api.com/max).

## Функциональность

- Авторизация по учётным данным инстанса GREEN-API (`idInstance`, `apiTokenInstance`) — проверка методом `getSettings`.
- Создание нового чата по номеру телефона получателя.
- Отправка текстовых сообщений методом [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/) (`chatId` формируется как `phoneNumber@c.us`).
- Получение входящих сообщений по технологии [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/): цикл `receiveNotification` → `deleteNotification`.
- Список чатов с непрочитанными счётчиками, статусы отправки сообщений (отправляется / отправлено ✓✓ / ошибка).
- Учётные данные сохраняются в `localStorage` (автовход при перезагрузке), кнопка «Выйти».

## Технологии

React 18 · TypeScript · Redux Toolkit · React Router · Vite · CSS

## Локальный запуск

Требуется Node.js 18+ и npm.

```bash
git clone <ссылка-на-репозиторий>
cd test-task-green-api
npm install
npm run dev
```

Откройте в браузере адрес, который выведет Vite (по умолчанию http://localhost:5173).

Для входа используйте `idInstance` и `apiTokenInstance` из личного кабинета GREEN-API (инстанс для мессенджера MAX).

## Сборка

```bash
npm run build     # production-сборка в dist/
npm run preview   # предпросмотр сборки
```

## Структура

```
src/
  app/            # store и типизированные хуки
  services/       # HTTP-клиент GREEN-API (fetch)
  store/          # слайсы auth и chats (Redux Toolkit)
  hooks/          # useNotifications — поллинг входящих уведомлений
  components/     # Sidebar, ChatWindow, MessageBubble, NewChatModal
  pages/          # LoginPage, ChatPage
  types/          # типы API GREEN-API и доменные типы чата
```
