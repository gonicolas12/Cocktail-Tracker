import type { RequestEvent } from '@sveltejs/kit';

// Types pour la configuration CORS
export type CorsOrigin = string[] | RegExp[] | boolean;

// Options de configuration CORS
export interface CorsOptions {
    origin: CorsOrigin;
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
}

// Configuration CORS par défaut
const DEFAULT_CORS_OPTIONS: CorsOptions = {
    // En production, spécifier les domaines autorisés
    origin: process.env.NODE_ENV === 'production'
    ? [
        'https://cocktail-tracker-gonicoals12s-projects.vercel.app',
        'https://cocktail-tracker-git-main-gonicoals12s-projects.vercel.app',
      ]
    : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    credentials: true, // Autoriser les cookies
    maxAge: 86400, // 24 heures
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Vérifier si l'origine est autorisée
function isOriginAllowed(origin: string | null, allowedOrigin: CorsOrigin): boolean {
    if (!origin) return false;
    
    // Si toutes les origines sont autorisées
    if (allowedOrigin === true) return true;
    
    // Si aucune origine n'est autorisée
    if (allowedOrigin === false) return false;
    
    // Si c'est un tableau d'origines autorisées
    if (Array.isArray(allowedOrigin)) {
        return allowedOrigin.some(allowed => {
            if (typeof allowed === 'string') {
                return origin === allowed;
            }
            // Ici, nous vérifions explicitement si c'est une RegExp
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return false;
        });
    }
    
    // Note: Ce cas ne devrait jamais se produire avec notre type CorsOrigin,
    // mais nous le gardons pour la sécurité du type
    return false;
}

// Middleware CORS pour SvelteKit
export function corsMiddleware(options: Partial<CorsOptions> = {}) {
    const corsOptions: CorsOptions = { ...DEFAULT_CORS_OPTIONS, ...options };
    
    return async ({ event, resolve }: { event: RequestEvent, resolve: any }) => {
        const request = event.request;
        const origin = request.headers.get('origin');
        const method = request.method;
        
        // Créer la réponse via le handler suivant
        const response = await resolve(event);
        const headers = new Headers(response.headers);
        
        // Si l'origine est autorisée, ajouter les en-têtes CORS
        if (origin && isOriginAllowed(origin, corsOptions.origin)) {
            // Allow-Origin
            headers.set('Access-Control-Allow-Origin', origin);
            
            // Allow-Credentials
            if (corsOptions.credentials) {
                headers.set('Access-Control-Allow-Credentials', 'true');
            }
            
            // Exposed-Headers
            if (corsOptions.exposedHeaders && corsOptions.exposedHeaders.length) {
                headers.set('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
            }
            
            // Requête OPTIONS (préflight)
            if (method === 'OPTIONS') {
                // Allow-Methods
                if (corsOptions.methods && corsOptions.methods.length) {
                    headers.set('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
                }
                
                // Allow-Headers
                if (corsOptions.allowedHeaders && corsOptions.allowedHeaders.length) {
                    headers.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
                } else {
                    // Si les headers ne sont pas spécifiés, utiliser les headers demandés
                    const requestHeaders = request.headers.get('access-control-request-headers');
                    if (requestHeaders) {
                        headers.set('Access-Control-Allow-Headers', requestHeaders);
                    }
                }
                
                // Max-Age
                if (corsOptions.maxAge) {
                    headers.set('Access-Control-Max-Age', corsOptions.maxAge.toString());
                }
                
                // Répondre immédiatement pour les requêtes préflight
                if (!corsOptions.preflightContinue) {
                    return new Response(null, {
                        status: corsOptions.optionsSuccessStatus,
                        headers
                    });
                }
            }
        }
        
        // Créer une nouvelle réponse avec les en-têtes CORS
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers
        });
    };
}