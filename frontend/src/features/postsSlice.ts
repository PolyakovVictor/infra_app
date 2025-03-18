import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { PostProps } from '../interfaces/features';
import { likePost, repostPost, fetchPosts } from '../services/api';

interface PostsState {
  posts: PostProps[];
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchPostsThunk = createAsyncThunk('posts/fetchPosts', async (_, { rejectWithValue }) => {
  try {
    const response = await fetchPosts();
    return response;
  } catch (error) {
    return rejectWithValue('Failed to fetch posts');
  }
});

export const likePostThunk = createAsyncThunk(
  'posts/likePost',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await likePost(postId);
      return { postId, status: response.status };
    } catch (error) {
      return rejectWithValue('Failed to like post');
    }
  }
);

export const repostPostThunk = createAsyncThunk(
  'posts/repostPost',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await repostPost(postId);
      return { postId, repost: response };
    } catch (error) {
      return rejectWithValue('Failed to repost');
    }
  }
);


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
  extraReducers: (builder) => {
    // Fetch Posts
    builder.addCase(fetchPostsThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPostsThunk.fulfilled, (state, action: PayloadAction<PostProps[]>) => {
      state.loading = false;
      state.posts = action.payload;
    });
    builder.addCase(fetchPostsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Like Post
    builder.addCase(likePostThunk.fulfilled, (state, action: PayloadAction<{ postId: number; status: string }>) => {
      const { postId, status } = action.payload;
      const post = state.posts.find((p) => p.id === postId);
      if (post) {
        post.is_liked = status === 'liked';
        post.likes_count = status === 'liked' ? post.likes_count + 1 : post.likes_count - 1;
      }
    });
    builder.addCase(likePostThunk.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Repost Post
    builder.addCase(repostPostThunk.fulfilled, (state, action: PayloadAction<{ postId: number; repost: PostProps }>) => {
      const { postId } = action.payload;
      const post = state.posts.find((p) => p.id === postId);
      if (post) {
        post.reposts_count += 1;
      }

    });
    builder.addCase(repostPostThunk.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { setPosts, addPost } = postsSlice.actions;
export default postsSlice.reducer;