import {NextRequest, NextResponse} from 'next/server';
import {XMLParser} from 'fast-xml-parser';

const API_URL = process.env.NEXT_PUBLIC_API || 'http://localhost:1337/api';

interface FeedItem {
    guid?: { "#text": string } | string;
    title?: string;
    description?: string;
    pubDate?: string;
    "itunes:duration"?: string;
    "itunes:image"?: { _href: string };

    [key: string]: any;
}

export async function GET(
    request: NextRequest,
    {params}: { params: { slug: string } }
) {
    const {slug} = params;
    const {searchParams} = new URL(request.url);
    const token = searchParams.get('token');

    try {
        // Get the base feed info
        const baseFeedResponse = await fetch(`${API_URL}/feeds/public`);
        if (!baseFeedResponse.ok) {
            return NextResponse.json(
                {error: 'Failed to fetch base feed data'},
                {status: baseFeedResponse.status}
            );
        }

        const baseFeeds = await baseFeedResponse.json();
        const baseFeed = baseFeeds.find((feed: any) => feed.slug === slug);

        if (!baseFeed) {
            return NextResponse.json(
                {error: 'Feed not found'},
                {status: 404}
            );
        }

        // Fetch the XML feed
        const url = token
            ? `${API_URL}/feeds/slug/${slug}/token/${token}`
            : `${API_URL}/feeds/slug/${slug}`;

        const response = await fetch(url);

        if (!response.ok) {
            return NextResponse.json(
                {error: 'Failed to fetch feed XML'},
                {status: response.status}
            );
        }

        // Get the XML content
        const xmlText = await response.text();

        // Parse the XML on the server
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "_",
        });
        const xmlData = parser.parse(xmlText);

        const channel = xmlData.rss?.channel;
        if (!channel) {
            return NextResponse.json(
                {error: 'Invalid RSS feed format'},
                {status: 400}
            );
        }

        // Extract feed data
        const title = channel.title || baseFeed.title;
        const description = channel.description || baseFeed.description;

        // Extract feed image
        let coverImage = baseFeed.cover || "";
        if (channel.image?.url) {
            coverImage = channel.image.url;
        } else if (channel["itunes:image"]?._href) {
            coverImage = channel["itunes:image"]._href;
        }

        // Extract episodes
        const episodes: Array<{
            guid: string;
            title: string;
            description: string;
            duration: number;
            releasedAt: string;
            cover: string;
        }> = [];

        const items = channel.item;
        if (items) {
            const itemArray: FeedItem[] = Array.isArray(items) ? items : [items];

            for (const item of itemArray) {
                const episodeGuid = typeof item.guid === 'object' && item.guid?.["#text"]
                    ? item.guid["#text"]
                    : (typeof item.guid === 'string' ? item.guid : `episode-${episodes.length}`);
                const episodeTitle = item.title || `Episode ${episodes.length + 1}`;
                const episodeDescription = item.description || "";
                const pubDate = item.pubDate || "";

                // Extract duration
                let duration = 0;
                if (item["itunes:duration"]) {
                    const durationStr = item["itunes:duration"];
                    duration = parseInt(durationStr) || 0;
                }

                // Extract image
                let image = "";
                if (item["itunes:image"]?._href) {
                    image = item["itunes:image"]._href;
                }

                episodes.push({
                    guid: episodeGuid,
                    title: episodeTitle,
                    description: episodeDescription,
                    duration,
                    releasedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                    cover: image
                });
            }
        }

        // Return the processed feed data
        return NextResponse.json({
            ...baseFeed,
            title,
            description,
            cover: coverImage,
            episodes
        });

    } catch (error) {
        console.error('Error processing feed:', error);
        return NextResponse.json(
            {error: 'Failed to process feed'},
            {status: 500}
        );
    }
}
