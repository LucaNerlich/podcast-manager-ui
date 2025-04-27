'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {AuthState, clearAuth, getAuth, saveAuth} from '../utils/auth';
import {login as apiLogin} from '../utils/api';

interface AuthContextType extends AuthState {
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [authState, setAuthState] = useState<AuthState>({user: null, jwt: null});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load auth state from storage on mount
        const savedAuth = getAuth();
        setAuthState(savedAuth);
        setLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await apiLogin(username, password);
            const newAuthState = {
                user: response.user,
                jwt: response.jwt
            };

            setAuthState(newAuthState);
            saveAuth(newAuthState); // This now saves to both localStorage and cookie
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setAuthState({user: null, jwt: null});
        clearAuth(); // This now clears both localStorage and cookie
    };

    return (
        <AuthContext.Provider
            value={{
                user: authState.user,
                jwt: authState.jwt,
                login,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
