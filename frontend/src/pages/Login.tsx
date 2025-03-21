import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/authSlice';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError(null);
      const response = await loginUser(username, password);
      const { access, refresh } = response;
      console.log(username);
      dispatch(login({ user: username, accessToken: access, refreshToken: refresh }));
      navigate(`/`);
    } catch (error: any) {
      setError('Login failed. Please check your credentials.');
      console.error('Login failed', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-6 bg-white dark:bg-gray-800 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Login to Reyo
        </h2>
        {error && (
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        )}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          onClick={handleLogin}
          className="w-full p-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;