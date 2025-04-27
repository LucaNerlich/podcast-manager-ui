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
    documentId: number;
    guid: string;
    title: string;
    description: string;
    duration: number;
    releasedAt: string;
    cover?: string;
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

// Function to fetch XML feed from the slug endpoint and parse it to extract feed details and episodes
export const getFeedWithEpisodesBySlug = async (slug: string, baseFeed: Feed, token?: string): Promise<Feed> => {
    const url = token
        ? `${API_URL}/feeds/slug/${slug}/token/${token}`
        : `${API_URL}/feeds/slug/${slug}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch feed XML with slug: ${slug}`);
    }

    // Get the XML content
    const xmlText = await response.text();

    // Check if we're in a browser environment (Client-side only)
    if (typeof window === 'undefined') {
        // Server-side - we don't have DOMParser, so return basic feed with empty episodes
        console.warn('XML parsing not available on server-side');
        return {
            ...baseFeed,
            episodes: []
        };
    }

    // Parse the XML (Client-side only)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Extract feed details (if needed)
    const channel = xmlDoc.querySelector("channel");
    const description = channel?.querySelector("description")?.textContent || baseFeed.description;
    const title = channel?.querySelector("title")?.textContent || baseFeed.title;

    // Find all items (episodes)
    const items = xmlDoc.querySelectorAll("item");
    const episodes: Episode[] = Array.from(items).map((item, index) => {
        // Extract episode data
        const guid = item.querySelector("guid")?.textContent || `episode-${index}`;
        const title = item.querySelector("title")?.textContent || `Episode ${index + 1}`;
        const description = item.querySelector("description")?.textContent || "";
        const pubDate = item.querySelector("pubDate")?.textContent || "";
        const duration = item.querySelector("itunes\\:duration")?.textContent || "0";
        const image = item.querySelector("itunes\\:image")?.getAttribute("href") || "";

        return {
            documentId: index,
            guid,
            title,
            description,
            duration: parseInt(duration) || 0,
            releasedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            cover: image
        };
    });

    // Return the feed with episodes
    return {
        ...baseFeed,
        description,
        title,
        episodes
    };
};

export const getEpisodeDownloadUrl = (episodeGuid: string, token?: string): string => {
    return token
        ? `${API_URL}/episodes/${episodeGuid}/download?token=${token}`
        : `${API_URL}/episodes/${episodeGuid}/download`;
};
