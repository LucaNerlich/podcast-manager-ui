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
    // Await the params to fix the Next.js warning
    const {slug} = await params;
    const {searchParams} = new URL(request.url);
    const token = searchParams.get('token');
    try {
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
        const title = channel.title;
        const description = channel.description;
        const isPublic = channel.public === 'true' || channel.public === true;

        // Extract feed image
        let cover = "";
        if (channel.image?.url) {
            cover = channel.image.url;
        } else if (channel["itunes:image"]?._href) {
            cover = channel["itunes:image"]._href;
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
            title,
            description,
            public: isPublic,
            cover,
            slug,
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
