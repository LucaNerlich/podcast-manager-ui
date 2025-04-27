'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Feed, getFeedEpisodes, getPrivateFeeds, getPublicFeeds} from './utils/api';
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
      let publicFeedsData = await getPublicFeeds();

      // Fetch episodes for each public feed
      for (let i = 0; i < publicFeedsData.length; i++) {
        try {
          const episodes = await getFeedEpisodes(publicFeedsData[i].documentId);
          publicFeedsData[i].episodes = episodes;
        } catch (err) {
          console.error(`Error fetching episodes for feed ${publicFeedsData[i].title}:`, err);
          publicFeedsData[i].episodes = [];
        }
      }

      setPublicFeeds(publicFeedsData);

      // Fetch private feeds if user is logged in
      if (jwt) {
        let privateFeedsData = await getPrivateFeeds(jwt);

        // Fetch episodes for each private feed
        for (let i = 0; i < privateFeedsData.length; i++) {
          try {
            const episodes = await getFeedEpisodes(privateFeedsData[i].documentId, jwt);
            privateFeedsData[i].episodes = episodes;
          } catch (err) {
            console.error(`Error fetching episodes for feed ${privateFeedsData[i].title}:`, err);
            privateFeedsData[i].episodes = [];
          }
        }

        setPrivateFeeds(privateFeedsData);
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
                    <FeedCard key={feed.id} feed={feed}/>
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
                        <FeedCard key={feed.id} feed={feed}/>
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
