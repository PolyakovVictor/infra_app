import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  isDarkMode: boolean;
}

const savedTheme = localStorage.getItem('theme');
const initialState: ThemeState = {
  isDarkMode: savedTheme ? savedTheme === 'dark' : false,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', state.isDarkMode);
    },
    setTheme(state, action: PayloadAction<boolean>) {
      state.isDarkMode = action.payload;
      localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', state.isDarkMode);
    },
  },
});

export const { toggleTheme, setTheme } = configSlice.actions;
export default configSlice.reducer;
