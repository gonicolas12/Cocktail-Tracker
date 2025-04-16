import { redirectIfAuthenticated } from '$lib/auth-protect';
import { loginUser } from '$lib/auth';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

// Protection de la route - rediriger si déjà connecté
export const load = redirectIfAuthenticated;

export const actions: Actions = {
    default: async ({ request, cookies, url }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        // Validation de base
        if (!email || !password) {
            return fail(400, { 
                error: 'Email et mot de passe sont requis',
                email
            });
        }
        
        // Tenter la connexion
        const result = await loginUser({ email, password }, cookies);
        
        if (!result.success) {
            return fail(401, { 
                error: result.error || 'Erreur de connexion',
                email
            });
        }
        
        // Si connexion réussie, rediriger vers la page demandée ou l'accueil
        const redirectTo = url.searchParams.get('redirect') || '/';
        throw redirect(302, redirectTo);
    }
};