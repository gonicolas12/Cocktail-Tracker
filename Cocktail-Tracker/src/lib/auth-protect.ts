import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Middleware pour protéger les routes nécessitant une authentification
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté
 */
export function protectRoute({ locals, url }: RequestEvent) {
    if (!locals.user) {
        // Sauvegarder l'URL actuelle pour y revenir après la connexion
        const returnUrl = encodeURIComponent(url.pathname + url.search);
        throw redirect(302, `/login?redirect=${returnUrl}`);
    }
    
    return {
        user: locals.user
    };
}

/**
 * Middleware pour les routes nécessitant un utilisateur non authentifié
 * (ex: login, register)
 * Redirige vers l'accueil si l'utilisateur est déjà connecté
 */
export function redirectIfAuthenticated({ locals, url }: RequestEvent) {
    if (locals.user) {
        // Si un paramètre de redirection est défini, l'utiliser
        const redirectTo = url.searchParams.get('redirect') || '/';
        throw redirect(302, redirectTo);
    }
    
    return {};
}

/**
 * Vérifie si l'utilisateur connecté est le propriétaire d'une ressource
 */
export function isResourceOwner(userId: number | null, resourceOwnerId: number): boolean {
    return userId !== null && userId === resourceOwnerId;
}