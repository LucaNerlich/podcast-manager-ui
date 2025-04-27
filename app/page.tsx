'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Feed, getPrivateFeeds, getPublicFeeds, getFeedWithEpisodesBySlug} from './utils/api';
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

            // Create a copy to avoid mutating the original
            const detailedPublicFeeds: Feed[] = [];

            // Fetch complete feed with episodes for each public feed
            for (let i = 0; i < publicFeedsData.length; i++) {
                try {
                    // Fetch and parse the XML feed
                    const feedWithEpisodes = await getFeedWithEpisodesBySlug(
                        publicFeedsData[i].slug,
                        publicFeedsData[i]
                    );
                    detailedPublicFeeds.push(feedWithEpisodes);
                } catch (err) {
                    console.error(`Error fetching feed with slug ${publicFeedsData[i].slug}:`, err);
                    // Add the basic feed without episodes if XML parsing fails
                    detailedPublicFeeds.push({
                        ...publicFeedsData[i],
                        episodes: []
                    });
                }
            }

            setPublicFeeds(detailedPublicFeeds);

            // Fetch private feeds if user is logged in
            if (jwt) {
                const privateFeedsData = await getPrivateFeeds(jwt);

                // Create a copy to avoid mutating the original
                const detailedPrivateFeeds: Feed[] = [];

                // Fetch complete feed with episodes for each private feed
                for (let i = 0; i < privateFeedsData.length; i++) {
                    try {
                        // Fetch and parse the XML feed
                        const feedWithEpisodes = await getFeedWithEpisodesBySlug(
                            privateFeedsData[i].slug,
                            privateFeedsData[i],
                            user?.token
                        );
                        detailedPrivateFeeds.push(feedWithEpisodes);
                    } catch (err) {
                        console.error(`Error fetching feed with slug ${privateFeedsData[i].slug}:`, err);
                        // Add the basic feed without episodes if XML parsing fails
                        detailedPrivateFeeds.push({
                            ...privateFeedsData[i],
                            episodes: []
                        });
                    }
                }

                setPrivateFeeds(detailedPrivateFeeds);
            }
        } catch (err) {
            console.error('Error fetching feeds:', err);
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
                                <FeedCard key={feed.documentId} feed={feed}/>
                            ))}
                        </div>
                    ) : (
                        <p>No private feeds available.</p>
                    )}
                </section>
            )}

            {!jwt && (
                <section style={{marginTop: '2rem'}}>
                    <div className="card">
                        <h3>Access Private Feeds</h3>
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
