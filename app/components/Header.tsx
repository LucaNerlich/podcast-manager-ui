'use client';

import React from 'react';
import Link from 'next/link';
import {useAuth} from '../context/AuthContext';
import {useRouter} from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
    const {user, logout} = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className={`${styles.header} container`}>
            <div className={styles.logo}>
                <Link href="/">
                    <h1>Podcast Manager UI</h1>
                </Link>
            </div>

            <nav className={styles.nav}>
                {user ? (
                    <div className={styles.userInfo}>
                        <span className={styles.username}>Willkommen, {user.username}</span>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link href="/login">
                        <button className="btn btn-primary">Login</button>
                    </Link>
                )}
            </nav>
        </div>
    );
}
