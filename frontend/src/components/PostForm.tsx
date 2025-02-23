import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store'; // Убедитесь, что путь правильный
import { addPost } from '../features/postsSlice';
import { createPost } from '../services/api';

const PostForm = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const handleSubmit = async () => {
    if (!accessToken) {
      setError('You must be logged in to post.');
      return;
    }

    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    try {
      setError(null);
      const response = await createPost(content, accessToken);
      dispatch(addPost(response));
      setContent('');
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error('Post creation error:', err);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's buzzing?"
        className="w-full p-2 border rounded resize-none"
        maxLength={280}
      />
      <button
        onClick={handleSubmit}
        className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Post
      </button>
    </div>
  );
};

export default PostForm;