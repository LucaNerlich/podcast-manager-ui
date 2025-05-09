import React from 'react';
import Link from 'next/link';
import {Feed, getEpisodeByGuid, getEpisodeDownloadUrl, getFeedFromApi} from '../../utils/api';
import {getServerSideAuth} from '../../utils/serverAuth';
import EpisodeActions from "@/app/episode/[guid]/EpisodeActions";
import DetailCard from '@/app/components/DetailCard';

// Format duration helper
function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else {
        return `${minutes}m ${remainingSeconds}s`;
    }
}

export default async function EpisodePage({params}: { params: { guid: string } }) {
    const {guid} = await params;
    const auth = await getServerSideAuth();

    try {
        // Fetch episode data
        const episode = await getEpisodeByGuid(guid, auth.user?.token);

        // Fetch feed data if available
        let feed: Feed | null = null;
        if (episode?.feedSlug) {
            try {
                feed = await getFeedFromApi(episode.feedSlug, auth.user?.token);
            } catch (feedErr) {
                console.error('Error fetching feed:', feedErr);
                // Continue even if feed fetch fails
            }
        }

        if (!episode) {
            return (
                <div className="container">
                    <div className="error-message">Episode not found</div>
                </div>
            );
        }

        // Format date
        const formattedDate = new Date(episode.releasedAt).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const downloadUrl = getEpisodeDownloadUrl(episode.guid, auth.user?.token);
        const episodeImage = episode.cover?.url;

        // Prepare header info
        const headerInfo = feed && (
            <div className="feed-info">
                <Link href={`/feed/${feed.slug}`} className="feed-link">
                    {feed.title}
                </Link>
                <span className={`badge ${feed.public ? 'badge-primary' : 'badge-secondary'}`}>
                    {feed.public ? 'Public' : 'Private'}
                </span>
            </div>
        );

        // Prepare metadata for DetailCard
        const metadata = (
            <>
                <div className="metadata-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                         viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>&nbsp;{formattedDate}</span>
                </div>

                {episode.duration > 0 && (
                    <div className="metadata-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="6" x2="12" y2="12"></line>
                            <line x1="12" y1="12" x2="16" y2="14"></line>
                        </svg>
                        <span>&nbsp;{formatDuration(episode.duration)}</span>
                    </div>
                )}

                {feed && (
                    <div className="metadata-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                        <span>From: <Link href={`/feed/${feed.slug}`}>{feed.title}</Link></span>
                    </div>
                )}
            </>
        );

        // Prepare episode actions
        const actions = <EpisodeActions downloadUrl={downloadUrl}/>;

        // Prepare related episodes
        const relatedEpisodes = feed && feed.episodes && feed.episodes.length > 1 && (
            <>
                {feed.episodes
                    .filter(ep => ep.guid !== episode.guid)
                    .slice(0, 5)
                    .map(episode => (
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
        );

        return (
            <div className="container">
                {headerInfo}
                <DetailCard
                    title={episode.title}
                    imageUrl={episodeImage}
                    description={episode.description}
                    metadata={metadata}
                    actions={actions}
                    listingTitle={feed && feed.episodes && feed.episodes.length > 1 ? "More Episodes" : undefined}
                    listingItems={relatedEpisodes || undefined}
                />
            </div>
        );
    } catch (error) {
        console.error('Error loading episode:', error);
        return (
            <div className="container">
                <div className="error-message">Failed to load episode details</div>
            </div>
        );
    }
}
