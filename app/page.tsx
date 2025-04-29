'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {Feed, getFeedFromApi, getPrivateFeeds, getPublicFeeds} from './utils/api';
import {useAuth} from './context/AuthContext';
import FeedCard from './components/FeedCard';

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
                <div style={{color: 'var(--danger-color)', marginBottom: '1rem'}}>
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
                <section style={{marginTop: '2rem'}}>
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
                <section style={{marginTop: '2rem'}}>
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

            <section className="app-section">
                <h2>Mini Apps</h2>
                <div className="app-grid">
                    {miniApps.map((app) => (
                        <Link key={app.path} href={app.path} className="app-card">
                            <div className="app-icon">{app.icon}</div>
                            <h3>{app.title}</h3>
                            <p>{app.description}</p>
                        </Link>
                    ))}
                </div>
            </section>

            <style jsx>{`
                .app-section {
                    margin-bottom: 2rem;
                }

                .app-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-top: 1rem;
                }

                .app-card {
                    display: block;
                    padding: 1.5rem;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    text-decoration: none;
                    color: inherit;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .app-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .app-icon {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                }

                .app-card h3 {
                    margin: 0 0 0.5rem 0;
                    color: #333;
                }

                .app-card p {
                    margin: 0;
                    color: #666;
                    font-size: 0.9rem;
                }

                @media (max-width: 600px) {
                    .app-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
