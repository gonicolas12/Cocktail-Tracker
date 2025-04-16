import { redirectIfAuthenticated } from '$lib/auth-protect';
import { registerUser, loginUser } from '$lib/auth';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

// Protection de la route - rediriger si déjà connecté
export const load = redirectIfAuthenticated;

export const actions: Actions = {
    default: async ({ request, cookies, url }) => {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const passwordConfirm = formData.get('passwordConfirm') as string;
        
        // Validation
        if (!username || !email || !password || !passwordConfirm) {
            return fail(400, { 
                error: 'Tous les champs sont requis',
                username,
                email
            });
        }
        
        if (password !== passwordConfirm) {
            return fail(400, { 
                error: 'Les mots de passe ne correspondent pas',
                username,
                email
            });
        }
        
        if (password.length < 6) {
            return fail(400, { 
                error: 'Le mot de passe doit contenir au moins 6 caractères',
                username,
                email
            });
        }
        
        // Tenter l'enregistrement
        const result = await registerUser({ username, email, password });
        
        if (!result.success) {
            return fail(400, { 
                error: result.error || 'Erreur d\'enregistrement',
                username,
                email
            });
        }
        
        // Si l'enregistrement réussit, connecter l'utilisateur automatiquement
        const loginResult = await loginUser({ email, password }, cookies);
        
        if (!loginResult.success) {
            return fail(500, { 
                error: 'Compte créé mais connexion automatique échouée. Veuillez vous connecter manuellement.',
                username,
                email
            });
        }
        
        // Rediriger vers la page demandée ou l'accueil
        const redirectTo = url.searchParams.get('redirect') || '/';
        throw redirect(302, redirectTo);
    }
};