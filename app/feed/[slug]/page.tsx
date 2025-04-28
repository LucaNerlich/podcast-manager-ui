import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {getFeedFromApi} from '../../utils/api';
import {getServerSideAuth} from '../../utils/serverAuth';

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

        return (
            <div className="container">
                <div className="feed-detail-page">
                    <div className="feed-detail-card">
                        <div className="feed-detail-content">
                            {feed.cover && (
                                <div className="feed-image-container">
                                    <Image
                                        src={feed.cover}
                                        alt={feed.title}
                                        width={300}
                                        height={300}
                                        className="feed-detail-image"
                                    />
                                </div>
                            )}

                            <div className="feed-detail-info">
                                <h1 className="feed-detail-title">{feed.title}</h1>
                                <div className="feed-detail-metadata">
                                    <span>🎙️{feed.episodes?.length || 0} Episoden</span>
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
                                </div>
                            </div>
                        </div>

                        <div className="feed-detail-description">
                            <h2>Beschreibung</h2>
                            <div className="description-content">
                                {feed.description}
                            </div>
                        </div>
                    </div>

                    <div className="feed-episodes">
                        <h2>Episoden</h2>
                        <div className="feed-episodes-list">
                            {feed.episodes && feed.episodes.length > 0 ? (
                                feed.episodes.map(episode => (
                                    <Link
                                        href={`/episode/${episode.guid}`}
                                        key={episode.guid}
                                        className="feed-episode-item"
                                    >
                                        <div className="feed-episode-title">{episode.title}</div>
                                        <div className="feed-episode-date">
                                            {new Date(episode.releasedAt).toLocaleDateString('de-DE', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="no-episodes">No episodes found</div>
                            )}
                        </div>
                    </div>
                </div>
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
