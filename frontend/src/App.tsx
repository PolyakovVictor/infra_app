import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from './features/authSlice';
import Home from './pages/Home';
import Login from './pages/Login';
import { RootState } from './store/store';

function App() {
  const dispatch = useDispatch();
  const { accessToken, refreshToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    const validateToken = async () => {
      if (storedAccessToken && storedRefreshToken) {
        try {
          dispatch(login({ user: 'user', accessToken: storedAccessToken, refreshToken: storedRefreshToken }));
        } catch (error) {
          console.error('Invalid token, logging out:', error);
          dispatch(logout());
        }
      }
    };

    validateToken();
  }, [dispatch]);

  const isAuthenticated = !!accessToken && !!refreshToken;

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && (
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Reyo</h1>
          <button
            onClick={() => dispatch(logout())}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </header>
      )}
      {isAuthenticated ? <Home /> : <Login />}
    </div>
  );
}

export default App;