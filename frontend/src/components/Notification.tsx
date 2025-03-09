import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { removeNotification } from '../features/notificationsSlice';
import { NotificationProps } from '../interfaces/features';

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notifications.notifications);

  const handleClick = (notification: NotificationProps) => {
    console.log('notification for remove: ', notification)
    dispatch(removeNotification(notification))
  }

  return (
    <div className="fixed top-4 right-4 w-80 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="p-4 bg-white shadow-lg rounded-lg border border-gray-200 animate-slide-in"
        >
          <p className="text-sm text-gray-800">{notification.message}</p>
          <p className="text-xs text-gray-500">{notification.created_at}</p>
          <button onClick={() => handleClick(notification)} className="text-xs text-red-700 hover:text-red-900">Close</button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;