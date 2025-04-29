import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/authSlice';
import { loginUser, registerUser } from '../services/api';
// import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const dispatch = useDispatch();
  // const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError(null);
      const response = await loginUser(username, password);
      const { access, refresh } = response;
      console.log(username);
      dispatch(login({ user: username, accessToken: access, refreshToken: refresh }));
      // navigate(`/`);
    } catch (error: any) {
      setError('Login failed. Please check your credentials.');
      console.error('Login failed', error);
    }
  };

  const handleRegister = async () => {
    try {
      setError(null);
      
      // Basic validation
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      // Call the register API function (you'll need to implement this in your API service)
      await registerUser(username, password, email);
      
      // Switch to login view after successful registration
      setIsLogin(true);
      setPassword('');
      setError('Registration successful! Please login.');
    } catch (error: any) {
      setError('Registration failed. Please try again.');
      console.error('Registration failed', error);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(null);
    setUsername('');
    setPassword('');
    setEmail('');
    setConfirmPassword('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-6 bg-white dark:bg-gray-800 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {isLogin ? 'Login to Reyo' : 'Register for Reyo'}
        </h2>
        
        {error && (
          <p className={`${error.includes('successful') ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'} mb-4`}>
            {error}
          </p>
        )}
        
        {/* Login Form */}
        {isLogin ? (
          <div>
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
              className="w-full p-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 mb-4"
            >
              Login
            </button>
          </div>
        ) : (
          /* Registration Form */
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              onClick={handleRegister}
              className="w-full p-2 bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 mb-4"
            >
              Register
            </button>
          </div>
        )}
        
        {/* Toggle between login and register */}
        <div className="text-center">
          <button 
            onClick={toggleForm} 
            className="text-blue-500 dark:text-blue-400 hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;