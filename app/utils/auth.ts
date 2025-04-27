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
        // Save to localStorage
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));

        // Save to cookie
        document.cookie = `${AUTH_KEY}=${JSON.stringify(auth)}; path=/; max-age=2592000`; // 30 days
    }
};

export const getAuth = (): AuthState => {
    if (typeof window !== 'undefined') {
        // Try localStorage first
        const authData = localStorage.getItem(AUTH_KEY);
        if (authData) {
            try {
                return JSON.parse(authData);
            } catch (error) {
                console.error('Failed to parse auth data from localStorage:', error);
            }
        }

        // Try cookie as fallback
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(c => c.trim().startsWith(`${AUTH_KEY}=`));
        if (authCookie) {
            try {
                const authJson = authCookie.split('=')[1];
                return JSON.parse(decodeURIComponent(authJson));
            } catch (error) {
                console.error('Failed to parse auth data from cookie:', error);
            }
        }
    }
    return {user: null, jwt: null};
};

export const clearAuth = () => {
    if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.removeItem(AUTH_KEY);

        // Clear cookie
        document.cookie = `${AUTH_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
};

export const isLoggedIn = (): boolean => {
    const {jwt} = getAuth();
    return !!jwt;
};
