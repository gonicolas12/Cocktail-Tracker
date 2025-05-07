import type { RequestEvent } from '@sveltejs/kit';

// Simple structure de stockage en mémoire pour le rate limiting
interface RateLimitStore {
    [key: string]: {
        count: number;
        resetAt: number;
    };
}

// Configuration par défaut
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 60; // 60 requêtes par minute

// Stockage en mémoire des tentatives
const requestCounter: RateLimitStore = {};

// Middleware de rate limiting basé sur l'IP
export function rateLimit(options: {
    windowMs?: number;
    maxRequests?: number;
    message?: string;
} = {}) {
    const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
    const maxRequests = options.maxRequests || DEFAULT_MAX_REQUESTS;
    const message = options.message || 'Trop de requêtes, veuillez réessayer plus tard';

    return async ({ event, resolve }: { event: RequestEvent, resolve: any }) => {
        // Obtenir l'IP du client
        const clientIp = event.getClientAddress();
        const now = Date.now();
        
        // Nettoyer les anciennes entrées
        cleanupOldEntries(requestCounter, now);
        
        // Initialiser ou récupérer l'entrée de l'utilisateur
        const userEntry = requestCounter[clientIp] || { count: 0, resetAt: now + windowMs };
        
        // Si la fenêtre de temps est passée, réinitialiser le compteur
        if (userEntry.resetAt < now) {
            userEntry.count = 0;
            userEntry.resetAt = now + windowMs;
        }
        
        // Vérifier si l'utilisateur a dépassé la limite
        if (userEntry.count >= maxRequests) {
            // Calculer quand le rate limit sera réinitialisé
            const resetTime = Math.ceil((userEntry.resetAt - now) / 1000); // en secondes
            
            // Ajouter les en-têtes de rate limit
            const response = new Response(JSON.stringify({ error: message }), {
                status: 429, // Too Many Requests
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(resetTime),
                    'X-RateLimit-Limit': String(maxRequests),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.ceil(userEntry.resetAt / 1000)) // timestamp unix
                }
            });
            
            return response;
        }
        
        // Incrémenter le compteur et sauvegarder l'entrée
        userEntry.count += 1;
        requestCounter[clientIp] = userEntry;
        
        // Ajouter les en-têtes de rate limit à la réponse
        const response = await resolve(event);
        response.headers.set('X-RateLimit-Limit', String(maxRequests));
        response.headers.set('X-RateLimit-Remaining', String(maxRequests - userEntry.count));
        response.headers.set('X-RateLimit-Reset', String(Math.ceil(userEntry.resetAt / 1000)));
        
        return response;
    };
}

/**
 * Rate limiting spécifique pour les routes d'authentification (login/register)
 * Plus restrictif pour prévenir les attaques par force brute
 */
export function authRateLimit() {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10, // 10 tentatives par 15 minutes
        message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
    });
}

// Rate limiting pour les actions qui modifient des données (POST, PUT, DELETE)
export function writeActionRateLimit() {
    return rateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30, // 30 requêtes par minute
        message: 'Trop de modifications. Veuillez ralentir vos actions.'
    });
}

// Nettoyer les entrées obsolètes du store
function cleanupOldEntries(store: RateLimitStore, now: number) {
    for (const key in store) {
        if (store[key].resetAt < now) {
            delete store[key];
        }
    }
}