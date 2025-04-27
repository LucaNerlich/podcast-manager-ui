import {cookies} from 'next/headers';
import {AuthState} from './auth';

export async function getServerSideAuth(): Promise<AuthState> {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('podcast_manager_auth');

    if (authCookie?.value) {
        try {
            return JSON.parse(authCookie.value);
        } catch (error) {
            console.error('Failed to parse auth cookie:', error);
        }
    }

    return {user: null, jwt: null};
}
