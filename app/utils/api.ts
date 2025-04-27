const API_URL = process.env.NEXT_PUBLIC_API || 'http://localhost:1337';

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
    id: number;
    documentId: string;
    title: string;
    description: string;
    public: boolean;
    slug: string;
    imageUrl?: string;
    episodes: Episode[];
}

export interface Episode {
    id: number;
    guid: string;
    title: string;
    description: string;
    duration: number;
    releasedAt: string;
    imageUrl?: string;
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

export const getFeedBySlug = async (slug: string, token?: string): Promise<Feed> => {
    const url = token
        ? `${API_URL}/feeds/slug/${slug}/token/${token}`
        : `${API_URL}/feeds/slug/${slug}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch feed with slug: ${slug}`);
    }

    return response.json();
};

export const getFeedUrl = (documentId: string): string => {
    return `${API_URL}/feeds/${documentId}`;
};

export const getEpisodeDownloadUrl = (episodeGuid: string, token?: string): string => {
    return token
        ? `${API_URL}/episodes/${episodeGuid}/download?token=${token}`
        : `${API_URL}/episodes/${episodeGuid}/download`;
};

// New function to fetch episodes for a feed
export const getFeedEpisodes = async (feedDocId: string, token?: string): Promise<Episode[]> => {
    // Use standard Strapi endpoint to get the feed with its episodes
    const url = `${API_URL}/feeds/${feedDocId}?populate=episodes`;

    const headers: HeadersInit = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {headers});

    if (!response.ok) {
        throw new Error(`Failed to fetch episodes for feed: ${feedDocId}`);
    }

    const data = await response.json();
    return data.data.attributes.episodes.data.map((episode: any) => ({
        id: episode.id,
        guid: episode.attributes.guid || episode.id.toString(),
        title: episode.attributes.title,
        description: episode.attributes.description,
        duration: episode.attributes.duration,
        releasedAt: episode.attributes.releasedAt,
        imageUrl: episode.attributes.image?.data?.url
    }));
};
