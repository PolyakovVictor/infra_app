import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { toggleTheme } from '../features/configSlice';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.config.isDarkMode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
    >
      {isDarkMode ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;