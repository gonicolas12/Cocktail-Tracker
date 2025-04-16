import { logoutUser } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { Actions, ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals, cookies }) => {
    console.log("Page de déconnexion chargée, utilisateur:", locals.user);
    
    if (!locals.user) {
        throw redirect(302, '/');
    }
    
    // Récupérer le token de session depuis les cookies
    const sessionToken = cookies.get('session');
    console.log("Token de session à supprimer:", sessionToken);
    
    if (sessionToken) {
        const result = await logoutUser(sessionToken, cookies);
        console.log("Résultat de déconnexion:", result);
    }
    
    throw redirect(302, '/');
};

// Action pour le formulaire de déconnexion (au cas où JS est désactivé)
export const actions: Actions = {
    default: async ({ cookies }) => {
        console.log("Action de déconnexion appelée");
        
        const sessionToken = cookies.get('session');
        console.log("Token de session à supprimer (action):", sessionToken);
        
        if (sessionToken) {
            const result = await logoutUser(sessionToken, cookies);
            console.log("Résultat de déconnexion (action):", result);
        }
        
        throw redirect(302, '/');
    }
};