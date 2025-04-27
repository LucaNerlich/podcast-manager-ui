'use client';

import React, {useState} from 'react';
import {Episode, Feed, getEpisodeDownloadUrl, getFeedUrl} from '../utils/api';
import {useAuth} from '../context/AuthContext';

interface FeedCardProps {
    feed: Feed;
}

export default function FeedCard({feed}: FeedCardProps) {
    const [showEpisodes, setShowEpisodes] = useState(false);
    const [copied, setCopied] = useState(false);
    const {user} = useAuth();

    const feedUrl = getFeedUrl(feed.documentId);

    const copyFeedUrl = async () => {
        try {
            await navigator.clipboard.writeText(feedUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <div className="card feed-card">
            <span className={`badge ${feed.public ? 'badge-primary' : 'badge-secondary'}`}>
                {feed.public ? 'Public' : 'Private'}
            </span>

            <h3 className="feed-title">{feed.title}</h3>
            <p className="feed-description">{feed.description}</p>

            <button
                onClick={copyFeedUrl}
                className="btn btn-primary"
                style={{
                    marginBottom: '15px',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                {copied ? '✓ Feed URL Copied!' : 'Copy Feed URL'}
            </button>

            <button
                className="btn btn-primary"
                onClick={() => setShowEpisodes(!showEpisodes)}
                style={{marginBottom: '15px'}}
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

    // Format date
    const releasedDate = new Date(episode.releasedAt);
    const formattedDate = releasedDate.toLocaleDateString('en-US', {
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
            <h5 className="episode-title">{episode.title}</h5>
            <div className="episode-date">{formattedDate}</div>

            <p className="episode-description">
                {episode.description?.length > 150
                    ? `${episode.description.substring(0, 150)}...`
                    : episode.description}
            </p>

            <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                <a
                    href={downloadUrl}
                    className="btn btn-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{flex: '1'}}
                >
                    Download Episode
                </a>
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
