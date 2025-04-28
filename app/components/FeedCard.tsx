'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Episode, Feed, getEpisodeDownloadUrl} from '../utils/api';
import {useAuth} from '../context/AuthContext';
import Image from "next/image";
import Link from "next/link";

interface FeedCardProps {
    feed: Feed;
}

// Number of episodes per page
const EPISODES_PER_PAGE = 5;

export default function FeedCard({feed}: FeedCardProps) {
    const [showEpisodes, setShowEpisodes] = useState(false);
    const [copied, setCopied] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState<string>('');
    const {user} = useAuth();

    const hasValidCover = feed.cover;

    // Reset pagination when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, yearFilter]);

    // Calculate available years for filtering
    const availableYears = useMemo(() => {
        if (!feed.episodes) return [];

        const years = new Set<string>();
        feed.episodes.forEach(episode => {
            const date = new Date(episode.releasedAt);
            years.add(date.getFullYear().toString());
        });

        return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
    }, [feed.episodes]);

    // Filter and search episodes
    const filteredEpisodes = useMemo(() => {
        if (!feed.episodes) return [];

        return feed.episodes.filter(episode => {
            const matchesSearch = searchTerm === '' ||
                episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                episode.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesYear = yearFilter === '' ||
                new Date(episode.releasedAt).getFullYear().toString() === yearFilter;

            return matchesSearch && matchesYear;
        });
    }, [feed.episodes, searchTerm, yearFilter]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredEpisodes.length / EPISODES_PER_PAGE);
    const paginatedEpisodes = useMemo(() => {
        const startIndex = (currentPage - 1) * EPISODES_PER_PAGE;
        return filteredEpisodes.slice(startIndex, startIndex + EPISODES_PER_PAGE);
    }, [filteredEpisodes, currentPage]);

    const copyFeedUrl = async () => {
        try {
            const feedUrl = feed.public
                ? `https://podcasthub.org/api/feeds/slug/${feed.slug}`
                : `https://podcasthub.org/api/feeds/slug/${feed.slug}/token/${user?.token}`
            await navigator.clipboard.writeText(feedUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy feed URL');
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="card feed-card">
            <div className="feed-header">
                {hasValidCover && (
                    <div className="feed-avatar">
                        <Image
                            src={feed.cover!}
                            alt={feed.title}
                            fill
                            className="avatar-img"
                        />
                    </div>
                )}

                <div className={!hasValidCover ? "feed-info-full" : "feed-info"}>
                    <Link href={`/feed/${feed.slug}`} className="feed-title-link">
                        <h3 className="feed-title">{feed.title}</h3>
                    </Link>
                </div>
            </div>

            <p className="feed-description">{feed.description}</p>

            <div className="button-group">
                <button
                    onClick={copyFeedUrl}
                    className="btn btn-primary"
                >
                    {copied ? '✓ Feed URL kopiert!' : 'Feed URL kopieren'}
                </button>

                <button
                    className="btn btn-primary"
                    onClick={() => setShowEpisodes(!showEpisodes)}
                >
                    {showEpisodes ? 'Episodes verstecken' : 'Episoden anzeigen'}
                </button>

                <Link href={`/feed/${feed.slug}`} className="btn btn-secondary">
                    Feed Details
                </Link>
            </div>

            {showEpisodes && feed.episodes && (
                <div className="episode-controls">
                    <div className="search-filter-container">
                        <input
                            type="text"
                            placeholder="Search episodes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />

                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="year-filter"
                        >
                            <option value="">All Years</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="episode-count">
                        <span>{filteredEpisodes.length} episodes</span>
                        {filteredEpisodes.length > 0 && (
                            <span> (showing {(currentPage - 1) * EPISODES_PER_PAGE + 1}-
                                {Math.min(currentPage * EPISODES_PER_PAGE, filteredEpisodes.length)}
                                of {filteredEpisodes.length})
                            </span>
                        )}
                    </div>
                </div>
            )}

            {showEpisodes && paginatedEpisodes.length > 0 && (
                <div className="episode-list">
                    {paginatedEpisodes.map((episode) => (
                        <EpisodeItem
                            key={episode.guid}
                            episode={episode}
                            userToken={user?.token}
                        />
                    ))}

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(1)}
                            >
                                &laquo;
                            </button>
                            <button
                                className="pagination-btn"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                &lsaquo;
                            </button>

                            <span className="page-info">{currentPage} / {totalPages}</span>

                            <button
                                className="pagination-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                &rsaquo;
                            </button>
                            <button
                                className="pagination-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(totalPages)}
                            >
                                &raquo;
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showEpisodes && paginatedEpisodes.length === 0 && (
                <div className="episode-list empty">
                    <p>No episodes match your search.</p>
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
    const [expanded, setExpanded] = useState(false);

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
            console.error('Failed to copy episode URL');
        }
    };

    // Check if description is long
    const isLongDescription = episode.description && episode.description.length > 150;
    const displayDescription = expanded ?
        episode.description :
        isLongDescription ? `${episode.description.substring(0, 150)}...` : episode.description;

    // Format duration from seconds to mm:ss or hh:mm:ss
    const formattedDuration = useMemo(() => {
        if (!episode.duration) return '';

        const hours = Math.floor(episode.duration / 3600);
        const minutes = Math.floor((episode.duration % 3600) / 60);
        const seconds = episode.duration % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }, [episode.duration]);

    return (
        <div className="episode-item">
            <div className="episode-header">
                {episode?.cover?.url && (
                    <div className="episode-avatar">
                        <Image
                            src={episode?.cover?.url}
                            alt={episode.title}
                            fill
                            className="avatar-img"
                        />
                    </div>
                )}

                <div className={episode?.cover?.url ? "episode-info-full" : "episode-info"}>
                    <h5 className="episode-title">{episode.title}</h5>
                    <div className="episode-metadata">
                        <span className="episode-date">{formattedDate}</span>
                        {formattedDuration && (
                            <span className="episode-duration">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="6" x2="12" y2="12"></line>
                                    <line x1="12" y1="12" x2="16" y2="14"></line>
                                </svg>
                                {formattedDuration}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {displayDescription && (
                <div className="episode-description">
                    <p>{displayDescription}</p>
                    {isLongDescription && (
                        <button
                            className="read-more-btn"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? 'Less' : 'More'}
                        </button>
                    )}
                </div>
            )}

            <div className="episode-actions-row">
                <Link
                    href={downloadUrl}
                    className="btn btn-primary episode-row-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2">
                        <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"></path>
                    </svg>
                    Download
                </Link>

                <button
                    onClick={copyDownloadUrl}
                    className="btn btn-secondary episode-row-btn"
                >
                    {copied ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy URL
                        </>
                    )}
                </button>

                <Link
                    href={`/episode/${episode.guid}`}
                    className="btn btn-outline episode-row-btn details-btn"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Details
                </Link>
            </div>
        </div>
    );
}
