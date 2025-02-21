import { Post } from '../features/postsSlice';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {post.user[0].toUpperCase()}
        </div>
        <p className="font-bold ml-3">{post.user}</p>
      </div>
      <p className="text-gray-800">{post.content}</p>
      <p className="text-gray-500 text-sm mt-2">
        {new Date(post.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default PostCard;