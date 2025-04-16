import { redirectIfAuthenticated } from '$lib/auth-protect';
import { registerUser } from '$lib/auth';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

// Protection de la route - rediriger si déjà connecté
export const load = redirectIfAuthenticated;

export const actions: Actions = {
    default: async ({ request, url }) => {
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
        
        // Au lieu de connecter automatiquement, rediriger vers la page de connexion
        // avec un message de succès
        throw redirect(302, '/login?registered=true');
    }
};