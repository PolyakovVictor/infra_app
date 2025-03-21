import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
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
      const response = await createPost(content);
      dispatch(addPost(response));
      setContent('');
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error('Post creation error:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      {error && <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's buzzing?"
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded resize-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
        maxLength={280}
      />
      <button
        onClick={handleSubmit}
        className="mt-2 p-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
      >
        Post
      </button>
    </div>
  );
};

export default PostForm;