import type {Metadata} from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: 'Podcast Hub UI',
    description: 'Podcast Hub UI bietet einfache Podcast RSS XML Feed Verwaltung. Public and Private',
    keywords: 'Podcast, Feed, XML, Private Feed, RSS',
    authors: [{name: 'Podcast Hub UI'}, {name: 'Susanne Görlitz'}],
    creator: 'Podcast Hub UI',
    publisher: 'Podcast Hub UI',
    formatDetection: {
        email: true,
        address: true,
        telephone: true,
    },
    alternates: {
        canonical: `/`,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_DOMAIN || 'https://ui.podcasthub.org'),
    openGraph: {
        emails: 'info@pnn-it.de',
        title: 'Podcast Hub UI',
        description: 'Podcast Hub UI bietet einfache Podcast XML Feed Verwaltung. Public and Private',
        url: '/',
        siteName: 'Podcast Hub UI',
        locale: 'de_DE',
        type: 'website',
        images: [
            {
                url: 'icon.jpg',
                width: 512,
                height: 211,
                alt: 'Podcast Hub UI',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Podcast Hub UI',
        description: 'Podcast Hub UI bietet einfache Podcast XML Feed Verwaltung. Public and Private',
        images: ['/icon.jpg'],
    },
    applicationName: 'Podcast Hub UI',
    category: 'Leisure, Podcast, Media',
    abstract: 'Podcast Hub UI bietet einfache Podcast XML Feed Verwaltung. Public and Private',
    referrer: 'same-origin',
    generator: 'Next.js',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="de">
        <body>
        <header></header>
        <main>
            {children}
        </main>
        <footer></footer>
        </body>
        </html>
    );
}
