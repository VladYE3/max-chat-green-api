import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { GreenApiCredentials } from '../types/api';
import { getSettings } from '../services/greenApi';

const STORAGE_KEY = 'green-api-credentials';

function loadCredentials(): GreenApiCredentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GreenApiCredentials;
    return parsed.idInstance && parsed.apiTokenInstance ? parsed : null;
  } catch {
    return null;
  }
}

export interface AuthState {
  credentials: GreenApiCredentials | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  credentials: loadCredentials(),
  isAuthenticated: loadCredentials() !== null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk<
  GreenApiCredentials,
  GreenApiCredentials,
  { rejectValue: string }
>('auth/login', async (creds, { rejectWithValue }) => {
  try {
    await getSettings(creds);
    return creds;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Ошибка авторизации');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.credentials = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(STORAGE_KEY);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.credentials = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Ошибка авторизации';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
