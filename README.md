# Podcast Manager UI

A simple Next.js UI client for a podcast management application backed by a Strapi v5 CMS.

## Features

- Simple authentication with localStorage persistence
- View public podcast feeds
- Access private feeds with authentication
- Download episodes from feeds
- Responsive design

## Getting Started

### Prerequisites

- Node.js 22.x
- npm 10.x
- Strapi v5 backend running

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with the following content:

```
NEXT_PUBLIC_API_URL=http://your-strapi-backend-url
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

```bash
npm run build
npm start
```

## API Endpoints

The application expects the following API endpoints from the Strapi backend:

- `/api/auth/local` - Login endpoint
- `/api/feeds/public` - Get public feeds
- `/api/feeds/list` - Get all feeds (protected by JWT)
- `/api/feeds/slug/:slug` - Get feed by slug
- `/api/feeds/slug/:slug/token/:token` - Get private feed with token
- `/api/episodes/:guid/download` - Download episode
- `/api/episodes/:guid/download?token=:token` - Download episode with token

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
