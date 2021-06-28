
export interface RegisterUser {
    name: string;
    email: string;
    gender: string;
    dob: string;
    password: string;
}

export interface LoginUser {
    email: string;
    password: string;
}

export interface UserData {
    name?: string;
    email?: string;
    uniqueUserId?: string;
    phone?: number;
    notificationToRead?: boolean;
    imageUrl?: string;
    id?: number;
    gender?: string;
    follower?: [];
    dob?: string;
    dateOfJoining?: string;
}
