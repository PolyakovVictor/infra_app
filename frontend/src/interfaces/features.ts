export interface PostProps {
    id: number;
    user: string;
    content: string;
    created_at: string;
    is_liked: boolean;
    likes_count: number;
    reposts_count: number;
    comments_count: number;
}

export interface PostCardProps {
    post: PostProps;
}


export interface NotificationProps {
    id: number;
    message: string;
    created_at: string;
}


export interface UserProfileProps {
    id: string;
    user: string;
    bio?: string;
    avatar?: File;
    created_at: string;
  }