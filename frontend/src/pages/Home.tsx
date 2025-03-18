import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setPosts } from '../features/postsSlice';
import { addNotification } from '../features/notificationsSlice';
import { fetchPosts, connectWebSocket } from '../services/api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import Notifications from '../components/Notification';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.posts.posts);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      if (!accessToken) {
        setError('No access token available');
        setLoading(false);
        return;
      }

      try {
        const postsResponse = await fetchPosts();
        console.log('postsResponse : ', postsResponse);
        dispatch(setPosts(postsResponse));
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const ws = connectWebSocket((data) => {
      dispatch(addNotification({
        id: data.id,
        message: data.message,
        created_at: data.created_at,
      }));
    });

    return () => {
      ws.close();
    };
  }, [dispatch, accessToken]);

  useEffect(() => {
    console.log('USEEFFECT test : ', posts);
  }, [posts]);

  const handleUserClick = (user: string) => {
    navigate(`/profile/${user}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h1 className="text-3xl font-bold mb-6">Reyo</h1>
        <PostForm />
        <div className="space-y-4 mt-6">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUserClick={() => handleUserClick(post.user)}
              />
            ))
          ) : (
            <p className="text-gray-500">No posts yet.</p>
          )}
        </div>
      </div>
      <div className="col-span-1">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <Notifications />
      </div>
    </div>
  );
};

export default Home;