

export interface PostData {
    id?: number;
    content?: string;
    postDate?: number;
    lastUpdateDate?: number;
    likeCount?: number;
    uniqueId?: string;
    userImage?: string;
    userName?: string;
    userId?: number;
    image?: string;
    video?: string;
    likedUserId?: string[];
    read?: string[];
    comments?: string[];
    bookmarks?: string[];
}
