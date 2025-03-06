import { useState } from 'react';
import { PostCardProps } from '../interfaces/features'
import { followToUser } from '../services/api';


const PostCard = ({ post }: PostCardProps) => {
  const [followed, setFollowed] = useState(false);

  const handleFollow = async () => {
    await followToUser(post);
    setFollowed(true);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {post.user[0].toUpperCase()}
        </div>
        <p className="font-bold ml-3">{post.user}</p>
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
        {new Date(post.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default PostCard;