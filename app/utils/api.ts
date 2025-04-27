const API_URL = process.env.NEXT_PUBLIC_API || 'http://localhost:1337/api';

export interface LoginResponse {
    jwt: string;
    user: {
        id: number;
        username: string;
        email: string;
        token: string;
    };
}

export interface Feed {
    documentId: string;
    title: string;
    description: string;
    public: boolean;
    slug: string;
    url: string;
    cover?: string;
    episodes: Episode[];
}

export interface Episode {
    guid: string;
    title: string;
    description: string;
    duration: number;
    releasedAt: string;
    cover?: {
        url: string;
    };
    feedSlug?: string;
}

export const login = async (identifier: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/auth/local`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({identifier, password}),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Login failed');
    }

    return response.json();
};

export const getPublicFeeds = async (): Promise<Feed[]> => {
    const response = await fetch(`${API_URL}/feeds/public`);

    if (!response.ok) {
        throw new Error('Failed to fetch public feeds');
    }

    return response.json();
};

export const getPrivateFeeds = async (token: string): Promise<Feed[]> => {
    const response = await fetch(`${API_URL}/feeds/list`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch private feeds');
    }

    return response.json();
};

/**
 * Fetches complete feed data including episodes from our Next.js API route
 */
export const getFeedFromApi = async (slug: string, token?: string): Promise<Feed> => {
    const url = token
        ? `/api/feeds/${slug}?token=${token}`
        : `/api/feeds/${slug}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch feed with slug: ${slug}`);
    }

    return response.json();
};

/**
 * Gets the URL for downloading an episode
 */
export const getEpisodeDownloadUrl = (episodeGuid: string, token?: string): string => {
    return token
        ? `${API_URL}/episodes/${episodeGuid}/download?token=${token}`
        : `${API_URL}/episodes/${episodeGuid}/download`;
};

/**
 * Fetch episode data directly by GUID
 */
export const getEpisodeByGuid = async (guid: string, token?: string): Promise<Episode> => {
    const url = token
        ? `${API_URL}/episodes/${guid}?token=${token}`
        : `${API_URL}/episodes/${guid}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch episode with GUID: ${guid}`);
    }

    return response.json();
};
