import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';

export function middleware(request: NextRequest) {
    // Get auth token from localStorage
    const authToken = request.cookies.get('podcast_manager_auth')?.value;

    // Check if we're on an admin route that requires auth
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

    // If it's an admin route and no auth token, redirect to login
    if (isAdminRoute && !authToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

// Only run middleware on matching routes
export const config = {
    matcher: ['/admin/:path*'],
};
