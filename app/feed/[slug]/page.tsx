import React from 'react';
import Link from 'next/link';
import {getFeedFromApi} from '../../utils/api';
import {getServerSideAuth} from '../../utils/serverAuth';
import DetailCard from '@/app/components/DetailCard';

export default async function FeedPage({params}: { params: { slug: string } }) {
    const {slug} = await params;
    const auth = await getServerSideAuth();

    try {
        // Fetch feed data
        const feed = await getFeedFromApi(slug, auth.user?.token);

        if (!feed) {
            return (
                <div className="container">
                    <div className="error-message">Feed not found</div>
                </div>
            );
        }

        const feedUrl = feed.public
            ? `https://podcasthub.org/api/feeds/slug/${slug}`
            : `https://podcasthub.org/api/feeds/slug/${slug}/token/${auth.user?.token}`

        // Prepare metadata for DetailCard
        const metadata = (
            <>
                <span>🎙️{feed.episodes?.length || 0} Episoden</span>
            </>
        );

        // Prepare actions for DetailCard
        const actions = (
            <Link
                href={feedUrl}
                target="_blank"
                className="btn btn-primary episode-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path
                        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                &nbsp;RSS Feed
            </Link>
        );

        // Prepare episode listing for DetailCard
        const episodesList = feed.episodes && feed.episodes.length > 0 ? (
            <>
                {feed.episodes.map(episode => (
                    <Link
                        href={`/episode/${episode.guid}`}
                        key={episode.guid}
                        className="listing-item"
                    >
                        <div className="listing-item-title">{episode.title}</div>
                        <div className="listing-item-date">
                            {new Date(episode.releasedAt).toLocaleDateString('de-DE', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </Link>
                ))}
            </>
        ) : (
            <div className="no-items">No episodes found</div>
        );

        return (
            <div className="container">
                <DetailCard
                    title={feed.title}
                    imageUrl={feed.cover}
                    description={feed.description}
                    metadata={metadata}
                    actions={actions}
                    listingTitle="Episoden"
                    listingItems={episodesList}
                />
            </div>
        );
    } catch (error) {
        console.error('Error loading feed:', error);
        return (
            <div className="container">
                <div className="error-message">Failed to load feed details</div>
            </div>
        );
    }
}
