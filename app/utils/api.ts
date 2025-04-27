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
    episodes: Episode[];
}

export interface Episode {
    id: number;
    guid: string;
    title: string;
    description: string;
    duration: number;
    releasedAt: string;
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

export const getEpisodeDownloadUrl = (episodeGuid: string, token?: string): string => {
    return token
        ? `${API_URL}/episodes/${episodeGuid}/download?token=${token}`
        : `${API_URL}/episodes/${episodeGuid}/download`;
};
