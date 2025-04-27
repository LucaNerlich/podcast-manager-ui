'use client';

import React, {useState} from 'react';
import {Episode, Feed, getEpisodeDownloadUrl} from '../utils/api';
import {useAuth} from '../context/AuthContext';
import Image from "next/image";
import Link from "next/link";

interface FeedCardProps {
    feed: Feed;
}

// Default placeholder images
const DEFAULT_FEED_IMAGE = 'https://placehold.co/400x400/3498db/ffffff?text=FEED';
const DEFAULT_EPISODE_IMAGE = 'https://placehold.co/400x400/2c3e50/ffffff?text=EP';

export default function FeedCard({feed}: FeedCardProps) {
    const [showEpisodes, setShowEpisodes] = useState(false);
    const [copied, setCopied] = useState(false);
    const {user} = useAuth();

    const feedImage = feed.cover || DEFAULT_FEED_IMAGE;

    const copyFeedUrl = async () => {
        try {
            await navigator.clipboard.writeText(feed.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <div className="card feed-card">
            <div className="feed-header">
                <div className="feed-avatar">
                    <Image
                        src={feedImage}
                        alt={feed.title}
                        fill
                        className="avatar-img"
                    />
                </div>

                <div>
                    <span className={`badge ${feed.public ? 'badge-primary' : 'badge-secondary'}`}>
                        {feed.public ? 'Public' : 'Private'}
                    </span>
                    <h3 className="feed-title">{feed.title}</h3>
                </div>
            </div>

            <p className="feed-description">{feed.description}</p>

            <button
                onClick={copyFeedUrl}
                className="btn btn-primary full-width-button"
            >
                {copied ? '✓ Feed URL Copied!' : 'Copy Feed URL'}
            </button>

            <button
                className="btn btn-primary full-width-button"
                onClick={() => setShowEpisodes(!showEpisodes)}
            >
                {showEpisodes ? 'Hide Episodes' : 'Show Episodes'}
            </button>

            {showEpisodes && feed.episodes && feed.episodes.length > 0 && (
                <div className="episode-list">
                    <h4>Episodes</h4>
                    {feed.episodes.map((episode) => (
                        <EpisodeItem
                            key={episode.guid}
                            episode={episode}
                            userToken={user?.token}
                        />
                    ))}
                </div>
            )}

            {showEpisodes && (!feed.episodes || feed.episodes.length === 0) && (
                <div className="episode-list">
                    <p>No episodes found for this feed.</p>
                </div>
            )}
        </div>
    );
}

interface EpisodeItemProps {
    episode: Episode;
    userToken?: string;
}

function EpisodeItem({episode, userToken}: EpisodeItemProps) {
    const downloadUrl = getEpisodeDownloadUrl(episode.guid, userToken);
    const [copied, setCopied] = useState(false);
    const episodeImage = episode.cover || DEFAULT_EPISODE_IMAGE;

    // Format date
    const releasedDate = new Date(episode.releasedAt);
    const formattedDate = releasedDate.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const copyDownloadUrl = async () => {
        try {
            await navigator.clipboard.writeText(downloadUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <div className="episode-item">
            <div className="episode-header">
                <div className="episode-avatar">
                    <Image
                        src={episodeImage}
                        alt={episode.title}
                        fill
                        className="avatar-img"
                    />
                </div>

                <div>
                    <h5 className="episode-title">{episode.title}</h5>
                    <div className="episode-date">{formattedDate}</div>
                </div>
            </div>

            <p className="episode-description">
                {episode.description?.length > 150
                    ? `${episode.description.substring(0, 150)}...`
                    : episode.description}
            </p>

            <div className="button-container">
                <Link
                    href={downloadUrl}
                    className="btn btn-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{flex: '1'}}
                >
                    Download Episode
                </Link>
                <button
                    onClick={copyDownloadUrl}
                    className="btn btn-secondary"
                    style={{flex: '1'}}
                >
                    {copied ? '✓ Copied!' : 'Copy URL'}
                </button>
            </div>
        </div>
    );
}
