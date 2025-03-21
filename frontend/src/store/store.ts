import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../features/authSlice';
import postsSlice from '../features/postsSlice';
import notificationsReducer from '../features/notificationsSlice';
import configReducer from '../features/configSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    posts: postsSlice,
    notifications: notificationsReducer,
    config: configReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;