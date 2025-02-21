import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="min-h-screen bg-gray-100">
      {user ? <Home /> : <Login />}
    </div>
  );
}

export default App;