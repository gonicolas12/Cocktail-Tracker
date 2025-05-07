// hooks.server.ts
import { supabase } from '$lib/supabase-server';
import { redirect, error } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { corsMiddleware } from '$lib/middleware/cors-config';
import { rateLimit, authRateLimit, writeActionRateLimit } from '$lib/middleware/rate-limiter';
import { handleApiError, ErrorType, createAppError } from '$lib/utils/error-handler';
import { sanitizeObject } from '$lib/utils/input-sanitizer';

// Middleware d'authentification
const authMiddleware: Handle = async ({ event, resolve }) => {
    // Récupérer le token de session depuis les cookies
    const sessionToken = event.cookies.get('session');
    
    // Si pas de token de session, continuer sans authentification
    if (!sessionToken) {
        event.locals.user = null;
        return resolve(event);
    }
    
    try {
        // Rechercher une session valide
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('user_id, expires_at')
            .eq('token', sessionToken)
            .single();
        
        // Vérifier si la session est valide
        if (sessionError || !sessionData) {
            // Session invalide ou expirée
            event.cookies.delete('session', { path: '/' });
            event.locals.user = null;
            return resolve(event);
        }
        
        // Vérifier l'expiration de la session
        const expiresAt = new Date(sessionData.expires_at);
        if (expiresAt < new Date()) {
            // Session expirée
            await supabase
                .from('sessions')
                .delete()
                .eq('token', sessionToken);
            
            event.cookies.delete('session', { path: '/' });
            event.locals.user = null;
            return resolve(event);
        }
        
        // Récupérer les détails de l'utilisateur
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username, email')
            .eq('id', sessionData.user_id)
            .single();
        
        if (userError || !userData) {
            event.locals.user = null;
        } else {
            event.locals.user = userData;
        }
        
        return resolve(event);
    } catch (e) {
        console.error('Erreur d\'authentification :', e);
        event.locals.user = null;
        return resolve(event);
    }
};

// Middleware CORS avec configuration personnalisée
const cors = corsMiddleware({
    // En production, spécifier les domaines autorisés
    origin: process.env.NODE_ENV === 'production'
        ? ['https://cocktail-tracker.com', 'https://app.cocktail-tracker.com']
        : true, // En développement, autoriser toutes les origines
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
});

// Middleware de rate limiting basé sur le chemin
const rateLimitMiddleware: Handle = async ({ event, resolve }) => {
    const path = event.url.pathname;
    const method = event.request.method;
    
    try {
        // Routes d'authentification (login, register)
        if (path.startsWith('/login') || path.startsWith('/register')) {
            return authRateLimit()({ event, resolve });
        }
        
        // Opérations de modification de données (POST, PUT, DELETE)
        if (method !== 'GET' && method !== 'OPTIONS') {
            return writeActionRateLimit()({ event, resolve });
        }
        
        // Rate limiting standard pour les autres routes
        return rateLimit()({ event, resolve });
    } catch (e) {
        console.error('Erreur de rate limiting:', e);
        return resolve(event);
    }
};

// Middleware de sanitisation des données
const sanitizationMiddleware: Handle = async ({ event, resolve }) => {
    try {
        // Sanitiser les paramètres de l'URL
        const url = event.url;
        const sanitizedParams = new URLSearchParams();
        for (const [key, value] of url.searchParams.entries()) {
            sanitizedParams.append(key, sanitizeObject({ value }).value);
        }
        
        // Créer une nouvelle URL avec les paramètres sanitisés
        const sanitizedUrl = new URL(url.origin + url.pathname);
        sanitizedUrl.search = sanitizedParams.toString();
        
        // Remplacer l'URL de l'événement
        // Note: cette méthode dépend de l'implémentation interne de SvelteKit
        // et pourrait ne pas fonctionner dans toutes les versions
        (event as any).url = sanitizedUrl;
        
        // Pour les requêtes avec un corps (POST, PUT, PATCH)
        if (['POST', 'PUT', 'PATCH'].includes(event.request.method)) {
            try {
                // Intercepter et sanitiser le corps si c'est du JSON
                const contentType = event.request.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    const originalBody = await event.request.json();
                    const sanitizedBody = sanitizeObject(originalBody);
                    
                    // Recréer la requête avec le corps sanitisé
                    const newRequest = new Request(event.request.url, {
                        method: event.request.method,
                        headers: event.request.headers,
                        body: JSON.stringify(sanitizedBody),
                        credentials: event.request.credentials,
                        cache: event.request.cache,
                        redirect: event.request.redirect,
                        integrity: event.request.integrity,
                        mode: event.request.mode,
                        referrer: event.request.referrer,
                        referrerPolicy: event.request.referrerPolicy
                    });
                    
                    // Remplacer la requête de l'événement
                    // Note: ceci dépend également de l'implémentation interne
                    (event as any).request = newRequest;
                }
                // Pour FormData, on sanitisera dans les fonctions d'action directement
            } catch (error) {
                console.error('Erreur lors de la sanitisation du corps:', error);
                // Continuer même en cas d'erreur de sanitisation
            }
        }
        
        // Sanitiser les en-têtes personnalisés si nécessaire
        // (généralement pas nécessaire, mais une couche supplémentaire de sécurité)
        
        return resolve(event);
    } catch (error) {
        console.error('Erreur du middleware de sanitisation:', error);
        return resolve(event); // Continuer même en cas d'erreur
    }
};

// Middleware de gestion d'erreurs
const errorHandler: Handle = async ({ event, resolve }) => {
    try {
        // Tenter de résoudre la requête
        const response = await resolve(event);
        return response;
    } catch (e) {
        // Si c'est une redirection SvelteKit, la laisser passer
        if (e instanceof Response && e.status >= 300 && e.status < 400) {
            return e;
        }
        
        // Si c'est une erreur SvelteKit, la convertir en AppError
        if (e && typeof e === 'object' && 'status' in e) {
            const svelteError = e as { status: number; message: string };
            
            // Mapper les erreurs SvelteKit vers nos types d'erreur
            let errorType = ErrorType.SERVER_ERROR;
            if (svelteError.status === 404) errorType = ErrorType.NOT_FOUND;
            else if (svelteError.status === 401) errorType = ErrorType.UNAUTHORIZED;
            else if (svelteError.status === 403) errorType = ErrorType.FORBIDDEN;
            else if (svelteError.status === 400) errorType = ErrorType.BAD_REQUEST;
            
            const appError = createAppError(
                errorType, 
                svelteError.message,
                { originalError: svelteError }
            );
            
            // API routes: retourner une réponse JSON
            if (event.url.pathname.startsWith('/api/')) {
                return handleApiError(appError, event);
            }
            
            // Autres routes: laisser SvelteKit gérer l'erreur
            throw error(appError.status, appError.message);
        }
        
        // Pour les autres types d'erreurs
        console.error('Erreur non gérée:', e);
        
        // API routes: formater l'erreur
        if (event.url.pathname.startsWith('/api/')) {
            return handleApiError(e instanceof Error ? e : new Error(String(e)), event);
        }
        
        // Autres routes: erreur générique
        throw error(500, 'Une erreur est survenue');
    }
};

/**
 * Combiner tous les middlewares dans le bon ordre
 * 1. CORS - Doit être avant tout pour traiter les en-têtes OPTIONS correctement
 * 2. Gestion d'erreurs - Pour capturer les erreurs des autres middlewares
 * 3. Rate limiting - Pour protéger contre les abus
 * 4. Sanitisation - Pour nettoyer les entrées avant traitement
 * 5. Authentification - Après avoir vérifié les limites et sanitisé les entrées
 */

export const handle = sequence(
    cors,
    errorHandler,
    rateLimitMiddleware,
    sanitizationMiddleware,
    authMiddleware
);