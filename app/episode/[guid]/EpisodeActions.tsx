'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

interface EpisodeActionsProps {
    downloadUrl: string;
}

export default function EpisodeActions({downloadUrl}: EpisodeActionsProps) {
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const copyDownloadUrl = async () => {
        try {
            await navigator.clipboard.writeText(downloadUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy episode URL');
        }
    };

    return (
        <>
            <div className="episode-actions-detail">
                <Link
                    href={downloadUrl}
                    className="btn btn-primary episode-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2">
                        <path
                            d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"></path>
                    </svg>
                    &nbsp;Episode herunterladen
                </Link>

                <button
                    onClick={copyDownloadUrl}
                    className="btn btn-secondary episode-btn"
                >
                    {copied ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            &nbsp;Kopiert!
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path
                                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            &nbsp;URL kopieren
                        </>
                    )}
                </button>
            </div>
        </>
    );
}
