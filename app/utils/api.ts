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
    
    // Extract feed cover image
    let coverImage = baseFeed.cover || "";
    
    // Try standard image tag first
    const imageElement = channel?.querySelector("image > url");
    if (imageElement && imageElement.textContent) {
        coverImage = imageElement.textContent;
    }
    
    // Try itunes:image tag if standard image not found
    if (!coverImage && channel) {
        // Try with different selectors for namespaced elements
        const imageSelectors = [
            "itunes\\:image",
            "*|image"
        ];
        
        for (const selector of imageSelectors) {
            const itunesImageElement = channel.querySelector(selector);
            if (itunesImageElement && itunesImageElement.getAttribute("href")) {
                coverImage = itunesImageElement.getAttribute("href") || "";
                break;
            }
        }
        
        // If still not found, try serializing and using regex
        if (!coverImage) {
            const serializer = new XMLSerializer();
            const channelXml = serializer.serializeToString(channel);
            
            const imageMatch = channelXml.match(/<itunes:image[^>]*href="([^"]*)"[^>]*>/i);
            if (imageMatch && imageMatch[1]) {
                coverImage = imageMatch[1];
            }
        }
    }
    
    console.log("Found feed cover image:", coverImage);

    // Find all items (episodes)
    const items = xmlDoc.querySelectorAll("item");
    const episodes: Episode[] = Array.from(items).map((item, index) => {
        // Extract episode data
        const guid = item.querySelector("guid")?.textContent || `episode-${index}`;
        const title = item.querySelector("title")?.textContent || `Episode ${index + 1}`;
        const description = item.querySelector("description")?.textContent || "";
        const pubDate = item.querySelector("pubDate")?.textContent || "";

        // Handle namespaced elements - multiple approaches to find the right one
        // First try with namespace prefix
        let duration = "";
        let image = "";

        // Try different selector patterns for itunes elements due to browser inconsistencies
        const durationSelectors = [
            "itunes\\:duration",
            "*|duration",
            "duration"
        ];

        for (const selector of durationSelectors) {
            const durationElement = item.querySelector(selector);
            if (durationElement && durationElement.textContent) {
                duration = durationElement.textContent;
                break;
            }
        }

        // Try different approaches for the image
        const imageSelectors = [
            "itunes\\:image",
            "*|image",
            "image"
        ];

        for (const selector of imageSelectors) {
            const imageElement = item.querySelector(selector);
            if (imageElement && imageElement.getAttribute("href")) {
                image = imageElement.getAttribute("href") || "";
                break;
            }
        }

        // If still no image, try a more direct approach with the raw XML
        if (!image) {
            // Get the raw XML string for the item
            const serializer = new XMLSerializer();
            const itemXml = serializer.serializeToString(item);

            // Use regex to extract the href attribute from itunes:image tag
            const imageMatch = itemXml.match(/<itunes:image[^>]*href="([^"]*)"[^>]*>/i);
            if (imageMatch && imageMatch[1]) {
                image = imageMatch[1];
            }
        }

        // If still no image, try a more generic approach to find any element with href attribute
        if (!image) {
            // Look for any element with href that might contain image or itunes
            const elements = item.querySelectorAll("*");
            for (const el of elements) {
                const nodeName = el.nodeName.toLowerCase();
                if ((nodeName.includes('image') || nodeName.includes('itunes:image')) && el.getAttribute("href")) {
                    image = el.getAttribute("href") || "";
                    break;
                }
            }
        }

        return {
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
        cover: coverImage,
        public: true,
        episodes
    };
};

export const getEpisodeDownloadUrl = (episodeGuid: string, token?: string): string => {
    return token
        ? `${API_URL}/episodes/${episodeGuid}/download?token=${token}`
        : `${API_URL}/episodes/${episodeGuid}/download`;
};
