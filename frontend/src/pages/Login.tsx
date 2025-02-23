import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/authSlice';
import { loginUser } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      setError(null);
      const response = await loginUser(username, password);
      const { access, refresh } = response.data;
      dispatch(login({ user: username, accessToken: access, refreshToken: refresh }));
    } catch (error: any) {
      setError('Login failed. Please check your credentials.');
      console.error('Login failed', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Login to RealBuzz</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={handleLogin}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;