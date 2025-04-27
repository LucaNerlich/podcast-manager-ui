export interface AuthUser {
    id: number;
    username: string;
    email: string;
    token: string;
}

export interface AuthState {
    user: AuthUser | null;
    jwt: string | null;
}

const AUTH_KEY = 'podcast_manager_auth';

export const saveAuth = (auth: AuthState) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    }
};

export const getAuth = (): AuthState => {
    if (typeof window !== 'undefined') {
        const authData = localStorage.getItem(AUTH_KEY);
        if (authData) {
            try {
                return JSON.parse(authData);
            } catch (error) {
                console.error('Failed to parse auth data:', error);
            }
        }
    }
    return {user: null, jwt: null};
};

export const clearAuth = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_KEY);
    }
};

export const isLoggedIn = (): boolean => {
    const {jwt} = getAuth();
    return !!jwt;
};
