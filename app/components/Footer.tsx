import React from 'react';
import Link from "next/link";
import styles from './Footer.module.css';

export default function Footer(): React.ReactElement {
    return (
        <footer className={styles.footer}>
            <p>built by <Link href="https://pnn-it.de">pnn-it.de</Link></p>
        </footer>
    )
}
