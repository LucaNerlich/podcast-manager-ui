'use client';

import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {Episode, Feed, getEpisodeDownloadUrl, getFeedFromApi, getPrivateFeeds, getPublicFeeds} from '../../utils/api';
import {useAuth} from '../../context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

// Default placeholder images
const DEFAULT_EPISODE_IMAGE = 'https://placehold.co/400x400/2c3e50/ffffff?text=EP';

export default function EpisodePage() {
    const params = useParams();
    const guid = params.guid as string;
    const router = useRouter();
    const {user, jwt, loading: authLoading} = useAuth();

    const [episode, setEpisode] = useState<Episode | null>(null);
    const [feed, setFeed] = useState<Feed | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imgError, setImgError] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        const fetchEpisodeDetails = async () => {
            try {
                setLoading(true);

                // First, get all public feeds
                const publicFeedsBasic = await getPublicFeeds();

                // Then, get detailed feed data for each public feed
                const publicFeeds: Feed[] = await Promise.all(
                    publicFeedsBasic.map((feed: Feed) =>
                        getFeedFromApi(feed.slug)
                    )
                );

                // Look for the episode in public feeds
                let foundFeed: Feed | null = null;
                let foundEpisode: Episode | null = null;

                for (const feed of publicFeeds) {
                    const episode = feed.episodes.find((ep: Episode) => ep.guid === guid);
                    if (episode) {
                        foundFeed = feed;
                        foundEpisode = episode;
                        break;
                    }
                }

                // If not found in public feeds and user is logged in, check private feeds
                if (!foundEpisode && jwt) {
                    const privateFeedsBasic = await getPrivateFeeds(jwt);

                    const privateFeeds: Feed[] = await Promise.all(
                        privateFeedsBasic.map((feed: Feed) =>
                            getFeedFromApi(feed.slug, jwt)
                        )
                    );

                    for (const feed of privateFeeds) {
                        const episode = feed.episodes.find((ep: Episode) => ep.guid === guid);
                        if (episode) {
                            foundFeed = feed;
                            foundEpisode = episode;
                            break;
                        }
                    }
                }

                if (foundEpisode && foundFeed) {
                    setEpisode(foundEpisode);
                    setFeed(foundFeed);
                } else {
                    setError('Episode not found');
                }
            } catch (err) {
                setError('Failed to load episode details');
            } finally {
                setLoading(false);
            }
        };

        fetchEpisodeDetails();
    }, [guid, jwt, authLoading]);

    const downloadUrl = episode ? getEpisodeDownloadUrl(episode.guid, user?.token) : '';

    const copyDownloadUrl = async () => {
        try {
            await navigator.clipboard.writeText(downloadUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy episode URL');
        }
    };

    // Format date
    const formattedDate = episode ? new Date(episode.releasedAt).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '';

    // Format duration
    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${remainingSeconds}s`;
        } else {
            return `${minutes}m ${remainingSeconds}s`;
        }
    };

    const episodeImage = imgError || !episode?.cover ? DEFAULT_EPISODE_IMAGE : episode.cover;

    if (loading || authLoading) {
        return (
            <div className="container">
                <p>Loading episode details...</p>
            </div>
        );
    }

    if (error || !episode || !feed) {
        return (
            <div className="container">
                <div className="error-message">{error || 'Episode not found'}</div>
                <button className="btn btn-primary" onClick={() => router.back()}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="episode-detail-page">
                <div className="episode-detail-header">
                    <button className="btn btn-outline back-button" onClick={() => router.back()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"></path>
                        </svg>
                        Back to Feed
                    </button>

                    <div className="feed-info">
                        <Link href={`/?feed=${feed.slug}`} className="feed-link">
                            {feed.title}
                        </Link>
                        <span className={`badge ${feed.public ? 'badge-primary' : 'badge-secondary'}`}>
                            {feed.public ? 'Public' : 'Private'}
                        </span>
                    </div>
                </div>

                <div className="episode-detail-card">
                    <div className="episode-detail-content">
                        <div className="episode-image-container">
                            <Image
                                src={episodeImage}
                                alt={episode.title}
                                width={300}
                                height={300}
                                className="episode-detail-image"
                                onError={() => setImgError(true)}
                            />
                        </div>

                        <div className="episode-detail-info">
                            <h1 className="episode-detail-title">{episode.title}</h1>

                            <div className="episode-detail-metadata">
                                <div className="metadata-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    <span>{formattedDate}</span>
                                </div>

                                {episode.duration > 0 && (
                                    <div className="metadata-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="6" x2="12" y2="12"></line>
                                            <line x1="12" y1="12" x2="16" y2="14"></line>
                                        </svg>
                                        <span>{formatDuration(episode.duration)}</span>
                                    </div>
                                )}

                                <div className="metadata-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                        <line x1="12" y1="19" x2="12" y2="23"></line>
                                        <line x1="8" y1="23" x2="16" y2="23"></line>
                                    </svg>
                                    <span>Episode #{feed.episodes.findIndex(ep => ep.guid === episode.guid) + 1}</span>
                                </div>
                            </div>

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
                                    Download Episode
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
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                <path
                                                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg>
                                            Copy URL
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="episode-detail-description">
                        <h2>Description</h2>
                        <div className="description-content">
                            {episode.description}
                        </div>
                    </div>
                </div>

                {feed.episodes.length > 1 && (
                    <div className="more-episodes">
                        <h2>More Episodes</h2>
                        <div className="more-episodes-list">
                            {feed.episodes
                                .filter(ep => ep.guid !== episode.guid)
                                .slice(0, 5)
                                .map(ep => (
                                    <Link
                                        href={`/episode/${ep.guid}`}
                                        key={ep.guid}
                                        className="more-episode-item"
                                    >
                                        <div className="more-episode-title">{ep.title}</div>
                                        <div className="more-episode-date">
                                            {new Date(ep.releasedAt).toLocaleDateString('de-DE', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </Link>
                                ))
                            }
                        </div>

                        <Link href={`/?feed=${feed.slug}`} className="view-all-link">
                            View all episodes
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
