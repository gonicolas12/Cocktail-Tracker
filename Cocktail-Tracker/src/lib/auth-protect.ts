import { redirect } from '@sveltejs/kit';
import type { ServerLoadEvent } from '@sveltejs/kit';

export function protectRoute(event: ServerLoadEvent) {
    // Vérifier si l'utilisateur est authentifié
    if (!event.locals.user) {
        throw redirect(303, '/login');
    }
    
    return {
        user: event.locals.user
    };
}