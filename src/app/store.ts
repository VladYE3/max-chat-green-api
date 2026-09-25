import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import chatsReducer from '../store/chatsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chats: chatsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
