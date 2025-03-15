import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setPosts } from '../features/postsSlice';
import { addNotification } from '../features/notificationsSlice';
import { fetchUserPosts, fetchUserProfile, connectWebSocket, updateUserProfile } from '../services/api';
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
  const [loading, setLoading] = useState(true);PostForm
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileProps | null>(null);
  const { user } = useParams<{ user: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');

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
        setAvatarInput(profileResponse.avatar || '');
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

    // const ws = connectWebSocket((data) => {
    //   dispatch(addNotification({
    //     id: data.id,
    //     message: data.message,
    //     created_at: data.created_at,
    //   }));
    // });

    // console.log(userProfile?.username === currentUser, userProfile?.username, currentUser)

    // return () => {
    //   ws.close();
    // };
  }, [dispatch, accessToken, user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!userProfile) return;
    try {
      const updatedProfile = await updateUserProfile({ bio: bioInput, avatar: avatarInput });
      setUserProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  console.log('##### my user ', currentUser, userProfile, userProfile?.user === currentUser)

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const isOwnProfile = userProfile?.user === currentUser;

  return (
    <div className="max-w-4xl mx-auto p-4 grid grid-cols-3 gap-6">
      <div className="col-span-2">
        {userProfile && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <input
                  type="text"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  placeholder="Enter avatar URL"
                  className="w-16 h-16 rounded-full object-cover border p-1"
                />
              ) : (
                <img
                  src={userProfile.avatar || '/default-avatar.png'}
                  alt="User avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{userProfile.user}</h1>
                {isEditing ? (
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="Tell something about yourself"
                    className="w-full mt-2 p-2 border rounded text-gray-600"
                  />
                ) : userProfile.bio ? (
                  <p className="text-gray-600">{userProfile.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio yet.</p>
                )}
                <p className="text-sm text-gray-400">
                  Joined {new Date(userProfile.created_at).toLocaleDateString()}
                </p>
              </div>
              {isOwnProfile && (
                <button
                  onClick={isEditing ? handleSave : handleEditToggle}
                  className={`ml-4 px-3 py-1 rounded ${
                    isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
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
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <p className="text-gray-500">No posts yet.</p>
          )}
        </div>
      </div>

      <div className="col-span-1">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <Notifications />
      </div>
    </div>
  );
};

export default UserProfile;