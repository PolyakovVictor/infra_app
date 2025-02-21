import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationModel {
  id: number;
  message: string;
  createdAt: string;
}

interface NotificationsState {
  notifications: NotificationModel[];
}

const initialState: NotificationsState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationModel>) => {
      state.notifications.unshift(action.payload);
    },
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;