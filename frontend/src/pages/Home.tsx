import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setPosts } from '../features/postsSlice';
import { fetchPosts } from '../services/api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';

const Home = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.posts.posts);

  useEffect(() => {
    const loadPosts = async () => {
      const response = await fetchPosts();
      dispatch(setPosts(response.data));
    };
    loadPosts();
  }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">RealBuzz</h1>
      <PostForm />
      <div className="space-y-4 mt-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Home;