import { NotificationModel } from '../features/notificationsSlice';

interface NotificationProps {
  notification: NotificationModel;
}

const Notification = ({ notification }: NotificationProps) => {
  return (
    <div className="bg-white p-3 rounded shadow mb-2 flex items-center">
      <span className="text-blue-500 mr-2">🔔</span>
      <p>{notification.message}</p>
      <p className="text-gray-500 text-sm ml-auto">
        {new Date(notification.createdAt).toLocaleTimeString()}
      </p>
    </div>
  );
};

export default Notification;