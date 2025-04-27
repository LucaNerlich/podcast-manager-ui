'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '../context/AuthContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const {login, user} = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user is already logged in, redirect to dashboard
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            setError('Username and password are required');
            return;
        }

        try {
            setIsLoggingIn(true);
            setError('');

            await login(username, password);
            router.push('/');
        } catch (err) {
            setError('Invalid username or password');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="container">
            <div className="login-form card">
                <h1>Login to Podcast Manager</h1>

                {error && (
                    <div style={{color: 'var(--danger-color)', marginBottom: '1rem'}}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoggingIn}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoggingIn}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}
