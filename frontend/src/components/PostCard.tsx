import { useState } from 'react';
import { PostProps } from '../interfaces/features';
import { useDispatch, useSelector } from 'react-redux';
import { followToUser } from '../services/api';
import { likePostThunk, repostPostThunk } from '../features/postsSlice'; // Путь к вашему слайсу
import { RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post }: { post: PostProps }) => {
  const [followed, setFollowed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.posts);

  const handleFollow = async () => {
    try {
      await followToUser(post.user);
      setFollowed(true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleLike = () => {
    dispatch(likePostThunk(post.id));
  };

  const handleRepost = () => {
    dispatch(repostPostThunk(post.id));
  };

  const handleUserClick = () => {
    navigate(`/profile/${post.user}`);
  };

  const handleCommentsClick = () => {
    navigate(`/post/${post.id}/comments`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {post.user[0].toUpperCase()}
        </div>
        <p
          className="font-bold ml-3 text-blue-600 cursor-pointer hover:underline"
          onClick={handleUserClick}
        >
          {post.user}
        </p>
        <button
          onClick={handleFollow}
          disabled={followed}
          className={`ml-auto px-3 py-1 rounded ${
            followed ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {followed ? 'Followed' : 'Follow'}
        </button>
      </div>
      <p className="text-gray-800">{post.content}</p>
      <p className="text-gray-500 text-sm mt-2">
        {new Date(post.created_at).toLocaleString()}
      </p>
      <div className="flex space-x-4 mt-3">
        <button
          onClick={handleLike}
          className={`flex items-center ${
            post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <span className="mr-1">❤️</span> {post.likes_count}
        </button>
        <button
          onClick={handleRepost}
          className="flex items-center text-gray-500 hover:text-blue-500"
        >
          <span className="mr-1">🔄</span> {post.reposts_count}
        </button>
        <button
          onClick={handleCommentsClick}
          className="flex items-center text-gray-500 hover:text-blue-500"
        >
          <span className="mr-1">💬</span> {post.comments_count}
        </button>
      </div>
    </div>
  );
};

export default PostCard;