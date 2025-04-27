import React from 'react';

export default function Footer() {
    return (
        <footer className="container" style={{
            marginTop: '2rem',
            borderTop: '1px solid var(--light-gray)',
            padding: '1rem 0',
            textAlign: 'center',
            color: 'var(--dark-gray)',
            fontSize: '0.9rem'
        }}>
            <p>© {new Date().getFullYear()} Podcast Manager. All rights reserved.</p>
        </footer>
    );
}
