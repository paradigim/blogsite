
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
