'use client';

import React, {useState} from 'react';
import {Episode, Feed, getEpisodeDownloadUrl} from '../utils/api';
import {useAuth} from '../context/AuthContext';

interface FeedCardProps {
    feed: Feed;
}

export default function FeedCard({feed}: FeedCardProps) {
    const [showEpisodes, setShowEpisodes] = useState(false);
    const {user} = useAuth();

    return (
        <div className="card feed-card">
      <span className={`badge ${feed.public ? 'badge-primary' : 'badge-secondary'}`}>
        {feed.public ? 'Public' : 'Private'}
      </span>

            <h3 className="feed-title">{feed.title}</h3>
            <p className="feed-description">{feed.description}</p>

            <button
                className="btn btn-primary"
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

    // Format date
    const releasedDate = new Date(episode.releasedAt);
    const formattedDate = releasedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="episode-item">
            <h5 className="episode-title">{episode.title}</h5>
            <div className="episode-date">{formattedDate}</div>

            <p className="episode-description">
                {episode.description.length > 150
                    ? `${episode.description.substring(0, 150)}...`
                    : episode.description}
            </p>

            <a
                href={downloadUrl}
                className="btn btn-primary download-btn"
                target="_blank"
                rel="noopener noreferrer"
            >
                Download Episode
            </a>
        </div>
    );
}
