import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setPosts } from '../features/postsSlice';
import { addNotification } from '../features/notificationsSlice';
import { fetchPosts, fetchNotifications } from '../services/api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import Notification from '../components/Notification';

const Home = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.posts.posts);
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!accessToken) {
        setError('No access token available');
        setLoading(false);
        return;
      }

      try {
        const postsResponse = await fetchPosts(accessToken);
        dispatch(setPosts(postsResponse.data));

        const notifResponse = await fetchNotifications(accessToken);
        notifResponse.data.forEach((notif: any) => dispatch(addNotification(notif)));
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch, accessToken]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

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