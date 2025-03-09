export interface PostProps {
    id: number;
    content: string;
    user: string;
    createdAt: string;
}

export interface PostCardProps {
    post: PostProps;
}


export interface NotificationProps {
    id: number;
    message: string;
    created_at: string;
}