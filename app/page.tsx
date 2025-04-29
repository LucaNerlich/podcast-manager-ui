import React from 'react';
import Link from 'next/link';
import {getFeedFromApi, getPublicFeeds} from './utils/api';
import FeedCard from './components/FeedCard';
import PrivateFeedsSection from './components/PrivateFeedsSection';
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

async function getPublicFeedData() {
    try {
        // Fetch public feeds
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
        return await Promise.all(publicFeedPromises);
    } catch (error) {
        console.error('Error fetching public feeds:', error);
        return [];
    }
}

export default async function HomePage() {
    // Fetch public feeds on the server
    const publicFeeds = await getPublicFeedData();

    // Extract slugs to pass to client component
    const publicSlugs = publicFeeds.map(feed => feed.slug);

    return (
        <div className="container">
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

            {/* Client component that handles private feeds */}
            <PrivateFeedsSection publicSlugs={publicSlugs}/>
        </div>
    );
}
