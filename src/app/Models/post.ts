
export interface PostData {
    id?: number;
    content?: string;
    postDate?: string;
    lastUpdateDate?: string;
    likeCount?: number;
    uniqueId?: string;
    userImage?: string;
    userName?: string;
    userId?: number;
    image?: string;
    video?: string;
    likedUserId?: string[];
    read?: string[];
    bookmarks?: string[];
}

export interface Comments {
    text?: string;
    commentTime?: string;
    commentedUserId?: number;
    userImage?: string;
    uniqueUserId?: string;
    userName?: string;
    id?: number;
}
