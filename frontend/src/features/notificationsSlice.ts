import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: number;
  message: string;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;