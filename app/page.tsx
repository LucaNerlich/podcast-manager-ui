'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {Feed, getFeedFromApi, getPrivateFeeds, getPublicFeeds} from './utils/api';
import {useAuth} from './context/AuthContext';
import FeedCard from './components/FeedCard';
import styles from './page.module.css';

// Mini-app interface for type safety
interface MiniApp {
    title: string;
    description: string;
    path: string;
    icon?: string;
}

// List of available mini apps
const miniApps: MiniApp[] = [
    {
        title: 'Time Calculator',
        description: 'Convert between different time units and formats',
        path: '/apps/time-calculator',
        icon: '⏱️',
    },
    // More apps will be added here in the future
];

export default function HomePage() {
    const [publicFeeds, setPublicFeeds] = useState<Feed[]>([]);
    const [privateFeeds, setPrivateFeeds] = useState<Feed[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const {user, jwt, loading: authLoading} = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Wait for auth to initialize
        if (authLoading) return;

        // Fetch data
        fetchFeeds();
    }, [authLoading]);

    const fetchFeeds = async () => {
        try {
            setLoading(true);
            setError('');

            // Always fetch public feeds
            const publicFeedsData = await getPublicFeeds();

            // Create arrays for the Promise.all calls
            const publicFeedPromises = publicFeedsData.map(feed =>
                getFeedFromApi(feed.slug)
                    .catch(err => {
                        // Handle errors for individual feeds
                        return {...feed, episodes: []};
                    })
            );

            // Fetch all public feeds in parallel
            const detailedPublicFeeds = await Promise.all(publicFeedPromises);
            setPublicFeeds(detailedPublicFeeds);

            // Fetch private feeds if user is logged in
            if (jwt) {
                const privateFeedsData = await getPrivateFeeds(jwt);

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

                // Filter out private feeds that are already in public feeds
                const uniquePrivateFeeds = detailedPrivateFeeds.filter(
                    privateFeed => !detailedPublicFeeds.some(
                        publicFeed => publicFeed.slug === privateFeed.slug
                    )
                );
                setPrivateFeeds(uniquePrivateFeeds);
            }
        } catch (err) {
            setError('Failed to load feeds. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="container">
                <p>Loading feeds...</p>
            </div>
        );
    }

    return (
        <div className="container">
            {error && (
                <div className={styles.danger_message}>
                    {error}
                </div>
            )}

            <section>
                <h2>Öffentliche Feeds</h2>
                {publicFeeds.length > 0 ? (
                    <div className="feed-grid">
                        {publicFeeds.map((feed) => (
                            <FeedCard key={feed.slug} feed={feed}/>
                        ))}
                    </div>
                ) : (
                    <p>No public feeds available.</p>
                )}
            </section>

            {jwt && (
                <section className={styles.section_margin}>
                    <h2>Private Feeds</h2>
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
            )}

            {!jwt && (
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
            )}

            <section className={styles.app_section}>
                <h2>Mini Apps</h2>
                <div className={styles.app_grid}>
                    {miniApps.map((app) => (
                        <Link key={app.path} href={app.path} className={styles.app_card}>
                            <div className={styles.app_icon}>{app.icon}</div>
                            <h3>{app.title}</h3>
                            <p>{app.description}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
