import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setPosts } from '../features/postsSlice';
import { addNotification } from '../features/notificationsSlice';
import {
  fetchUserPosts,
  fetchUserProfile,
  connectWebSocket,
  updateUserProfile,
} from '../services/api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import Notifications from '../components/Notification';
import { UserProfileProps } from '../interfaces/features';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.posts.posts);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileProps | null>(null);
  const { user } = useParams<{ user: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Change to File type

  useEffect(() => {
    const loadData = async () => {
      if (!accessToken) {
        setError('No access token available');
        setLoading(false);
        return;
      }

      try {
        const profileResponse = await fetchUserProfile(user!);
        setUserProfile(profileResponse);
        setBioInput(profileResponse.bio || '');
        const postsResponse = await fetchUserPosts(profileResponse.user);
        dispatch(setPosts(postsResponse));
      } catch (err) {
        setError('Failed to load profile or posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Uncomment if WebSocket is needed
    const ws = connectWebSocket((data) => {
      dispatch(addNotification({
        id: data.id,
        message: data.message,
        created_at: data.created_at,
      }));
    });
    
    return () => {
      ws.close();
    };
  }, [dispatch, accessToken, user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]); // Store the selected file
    }
  };

  const handleSave = async () => {
    if (!userProfile) return;
    try {
      const updatedProfile = await updateUserProfile({ bio: bioInput, avatar: avatarFile });
      setUserProfile(updatedProfile);
      setIsEditing(false);
      setAvatarFile(null); // Reset file input after save
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  if (loading)
    return <p className="text-gray-800 dark:text-gray-200">Loading...</p>;
  if (error)
    return <p className="text-red-500 dark:text-red-400">{error}</p>;

  const isOwnProfile = userProfile?.user === currentUser;

  return (
    <div className="max-w-4xl mx-auto p-4 grid grid-cols-3 gap-6">
      <div className="col-span-2">
        {userProfile && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <input
                  type="file"
                  accept="image/*" // Restrict to images
                  onChange={handleFileChange}
                  className="w-full text-gray-800 dark:text-gray-200"
                />
              ) : (
                userProfile.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt="User avatar"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {userProfile.user[0].toUpperCase()}
                  </div>
                )
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile.user}
                </h1>
                {isEditing ? (
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="Tell something about yourself"
                    className="w-full mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                ) : userProfile.bio ? (
                  <p className="text-gray-600 dark:text-gray-300">{userProfile.bio}</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No bio yet.</p>
                )}
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Joined {new Date(userProfile.created_at).toLocaleDateString()}
                </p>
              </div>
              {isOwnProfile && (
                <button
                  onClick={isEditing ? handleSave : handleEditToggle}
                  className={`ml-4 px-3 py-1 rounded ${
                    isEditing
                      ? 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700'
                      : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700'
                  } text-white`}
                >
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              )}
            </div>
          </div>
        )}

        {isOwnProfile && (
          <div className="mb-6">
            <PostForm />
          </div>
        )}

        <div className="space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
          )}
        </div>
      </div>

      <div className="col-span-1">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Notifications
        </h2>
        <Notifications />
      </div>
    </div>
  );
};

export default UserProfile;