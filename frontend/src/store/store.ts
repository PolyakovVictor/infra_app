import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../features/authSlice';
import postsSlice from '../features/postsSlice';
import notificationsSlice from '../features/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    posts: postsSlice,
    notifications: notificationsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;