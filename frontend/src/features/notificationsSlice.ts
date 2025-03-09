import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationProps } from './../interfaces/features'

export interface NotificationsStateProps {
  notifications: NotificationProps[];
}

const initialState: NotificationsStateProps = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<NotificationProps[]>) {
      state.notifications = action.payload;
    },
    addNotification(state, action: PayloadAction<NotificationProps>) {
      state.notifications.unshift(action.payload);
    },
    removeNotification(state, action: PayloadAction<NotificationProps>) {
      console.log('THIS MY action: ', action) 
      state.notifications.splice(action.payload.id);
    }
  },
});

export const { setNotifications, addNotification, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;