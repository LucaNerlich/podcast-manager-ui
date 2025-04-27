import {Routes} from './utils/routes'
import {MetadataRoute} from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://ui.podcasthub.org'

    const routes = Object.values(Routes)
    const date = new Date()
    const staticPageFrequency = 'weekly' as const

    return [
        ...routes.map((route) => ({
            url: `${baseUrl}${route}`,
            lastModified: date,
            changeFrequency: staticPageFrequency,
            priority: route === Routes.HOME ? 1 : 0.8,
            alternates: {
                languages: {
                    de: `${baseUrl}${route}`,
                    'x-default': `${baseUrl}${route}`,
                },
            },
        })),
    ]
}
