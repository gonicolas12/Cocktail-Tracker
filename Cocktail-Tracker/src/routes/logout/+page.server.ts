import { logoutUser } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { Actions, ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals, cookies }) => {
    if (!locals.user) {
        throw redirect(302, '/');
    }
    
    // Récupérer le token de session depuis les cookies
    const sessionToken = cookies.get('session');
    
    if (sessionToken) {
        await logoutUser(sessionToken, cookies);
    }
    
    throw redirect(302, '/');
};

// Action pour le formulaire de déconnexion
export const actions: Actions = {
    default: async ({ cookies }) => {
        const sessionToken = cookies.get('session');
        
        if (sessionToken) {
            await logoutUser(sessionToken, cookies);
        }
        
        throw redirect(302, '/');
    }
};