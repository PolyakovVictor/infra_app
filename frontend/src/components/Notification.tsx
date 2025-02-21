import { NotificationModel } from '../features/notificationsSlice';
import { motion } from 'framer-motion';

interface NotificationProps {
  notification: NotificationModel;
}

const Notification = ({ notification }: NotificationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-3 rounded shadow mb-2 flex items-center"
    >
      <span className="text-blue-500 mr-2">🔔</span>
      <p>{notification.message}</p>
      <p className="text-gray-500 text-sm ml-auto">
        {new Date(notification.createdAt).toLocaleTimeString()}
      </p>
    </motion.div>
  );
};

export default Notification;