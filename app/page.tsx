'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Feed, getFeedFromApi, getPrivateFeeds, getPublicFeeds} from './utils/api';
import {useAuth} from './context/AuthContext';
import FeedCard from './components/FeedCard';

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
                setPrivateFeeds(detailedPrivateFeeds);
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
                <h2>Public Feeds</h2>
                {publicFeeds.length > 0 ? (
                    <div className="feed-grid">
                        {publicFeeds.map((feed) => (
                            <FeedCard key={feed.slug} feed={feed} isPublic/>
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
                                <FeedCard key={crypto.randomUUID()} feed={feed} isPublic={false}/>
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
        </div>
    );
}
