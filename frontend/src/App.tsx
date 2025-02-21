import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/store';
import { logout } from './features/authSlice';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen bg-gray-100">
      {user && (
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">RealBuzz</h1>
          <button
            onClick={() => dispatch(logout())}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </header>
      )}
      {user ? <Home /> : <Login />}
    </div>
  );
}

export default App;