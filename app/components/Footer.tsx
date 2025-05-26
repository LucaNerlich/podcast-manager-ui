import React from 'react';
import styles from './Footer.module.css'; // Import the CSS module

export default function Footer() {
    return (
        <footer className={`${styles.footer} container`}>
            <p>© {new Date().getFullYear()} Podcast Manager. All rights reserved.</p>
        </footer>
    );
}
