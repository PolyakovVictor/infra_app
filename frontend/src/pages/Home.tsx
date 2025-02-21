import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setPosts } from '../features/postsSlice';
import { addNotification } from '../features/notificationsSlice';
import { fetchPosts, fetchNotifications, connectWebSocket } from '../services/api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import Notification from '../components/Notification';

const Home = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.posts.posts);
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const loadPosts = async () => {
      const response = await fetchPosts();
      dispatch(setPosts(response.data));
    };
    const loadNotifications = async () => {
      if (token) {
        const response = await fetchNotifications(token);
        response.data.forEach((notif: any) => dispatch(addNotification(notif)));
      }
    };
    loadPosts();
    loadNotifications();

    if (token) {
      const ws = connectWebSocket(token, (data) => {
        dispatch(addNotification(data));
      });
      return () => ws.close(); // Очистка при размонтировании
    }
  }, [dispatch, token]);

  return (
    <div className="max-w-4xl mx-auto p-4 grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h1 className="text-3xl font-bold mb-6">RealBuzz</h1>
        <PostForm />
        <div className="space-y-4 mt-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
      <div className="col-span-1">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-2">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <Notification key={notif.id} notification={notif} />
            ))
          ) : (
            <p className="text-gray-500">No notifications yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;