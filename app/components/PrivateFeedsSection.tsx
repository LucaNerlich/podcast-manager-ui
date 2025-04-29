'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '../context/AuthContext';
import {Feed, getFeedFromApi, getPrivateFeeds} from '../utils/api';
import FeedCard from './FeedCard';
import styles from '../page.module.css';

interface PrivateFeedsSectionProps {
    publicSlugs: string[];
}

export default function PrivateFeedsSection({publicSlugs}: PrivateFeedsSectionProps) {
    const [privateFeeds, setPrivateFeeds] = useState<Feed[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {user, jwt, loading: authLoading} = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Wait for auth to initialize
        if (authLoading) return;

        // If no JWT, don't try to fetch
        if (!jwt) {
            setLoading(false);
            return;
        }

        // Fetch private feeds
        fetchPrivateFeeds();
    }, [jwt, authLoading, user, publicSlugs]);

    const fetchPrivateFeeds = async () => {
        try {
            setLoading(true);
            setError(null);

            const privateFeedsData = await getPrivateFeeds(jwt!);
            console.log("privateFeedsData", privateFeedsData);

            // Create private feed promises array
            const privateFeedPromises = privateFeedsData.map(feed =>
                getFeedFromApi(feed.slug, user?.token)
                    .catch(err => {
                        // Handle errors for individual feeds
                        return {...feed, episodes: []};
                    })
            );

            // Fetch all private feeds in parallel
            const detailedPrivateFeeds = await Promise.all(privateFeedPromises);

            // Filter out feeds that are already shown in the public section
            const uniquePrivateFeeds = detailedPrivateFeeds.filter(
                privateFeed => !publicSlugs.includes(privateFeed.slug)
            );

            setPrivateFeeds(uniquePrivateFeeds);
        } catch (err) {
            setError('Failed to load private feeds. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading private feeds...</p>;
    }

    if (!jwt) {
        return (
            <section className={styles.section_margin}>
                <div>
                    <h2>Access Private Feeds</h2>
                    <p>Please log in to access your private feeds.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => router.push('/login')}
                    >
                        Login
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section_margin}>
            <h2>Private Feeds</h2>
            {error && <div className={styles.danger_message}>{error}</div>}
            {privateFeeds.length > 0 ? (
                <div className="feed-grid">
                    {privateFeeds.map((feed) => (
                        <FeedCard key={crypto.randomUUID()} feed={feed}/>
                    ))}
                </div>
            ) : (
                <p>No private feeds available.</p>
            )}
        </section>
    );
}
