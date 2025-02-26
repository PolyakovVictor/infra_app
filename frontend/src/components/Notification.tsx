// src/components/Notifications.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setNotifications, addNotification } from '../features/notificationsSlice';

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notifications.notifications);


  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await fetch('http://localhost:8000/api/notifications/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      dispatch(setNotifications(data));
    };

    useEffect(() => {
      const ws = new WebSocket('ws://localhost:8000/ws/notifications/');
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        dispatch(addNotification({ id: Date.now(), message: data.message, created_at: new Date().toISOString() }));
      };
      return () => ws.close();
    }, [dispatch]);

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="fixed top-4 right-4 w-80 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="p-4 bg-white shadow-lg rounded-lg border border-gray-200 animate-slide-in"
        >
          <p className="text-sm text-gray-800">{notification.message}</p>
          <p className="text-xs text-gray-500">{notification.created_at}</p>
          <button className="text-xs text-red-500 hover:text-red-700">Закрыть</button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;