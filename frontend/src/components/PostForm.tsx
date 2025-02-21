import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { addPost } from '../features/postsSlice';
import { createPost } from '../services/api';

const PostForm = () => {
  const [content, setContent] = useState('');
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const handleSubmit = async () => {
    if (!token) return;
    const response = await createPost(content, token);
    dispatch(addPost(response.data));
    setContent('');
  };

  return (
    <div className="bg-white p-4 rounded shadow">
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