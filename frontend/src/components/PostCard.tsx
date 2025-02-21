import { Post } from '../features/postsSlice';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="font-bold">{post.user}</p>
      <p>{post.content}</p>
      <p className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleString()}</p>
    </div>
  );
};

export default PostCard;