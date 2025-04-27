import React from 'react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50vh'
        }}>
            <h1>404 - Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <Link href="/">
                <button className="btn btn-primary">Go Home</button>
            </Link>
        </div>
    );
}
