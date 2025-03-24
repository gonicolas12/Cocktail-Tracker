export type User = {
    id: number;
    username: string;
    email: string;
    created_at?: string;
};

export type UserRegistrationData = {
    username: string;
    email: string;
    password: string;
};

export type UserLoginData = {
    email: string;
    password: string;
};