import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PostProps } from '../interfaces/features';


interface PostsState {
  posts: PostProps[];
}

const initialState: PostsState = {
  posts: [],
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<PostProps[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<PostProps>) => {
      state.posts.unshift(action.payload);
    },
  },
});

export const { setPosts, addPost } = postsSlice.actions;
export default postsSlice.reducer;
