/// Configuration centralisée pour les paramètres de sécurité de l'application

export const SecurityConfig = {
    // Rate limiting
    rateLimit: {
        global: {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 60 // 60 requêtes par minute
        },
        auth: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 10 // 10 tentatives par 15 minutes
        },
        api: {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 30 // 30 requêtes par minute
        }
    },
    
    // Paramètres de session
    session: {
        cookieName: 'session',
        expiryDays: 30,
        tokenLength: 48, // Longueur du token en octets
        sameSite: 'strict' as const, // 'strict', 'lax', 'none'
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined,
    },
    
    // Configuration CORS
    cors: {
        // Domaines autorisés en production
        allowedOrigins: process.env.NODE_ENV === 'production'
            ? [
                'https://cocktail-tracker.com',
                'https://app.cocktail-tracker.com',
              ]
            : true, // Autoriser toutes les origines en développement
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
        credentials: true, // Autoriser les cookies
        maxAge: 86400, // 24 heures
    },
    
    // En-têtes de sécurité HTTP
    securityHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // Content Security Policy - Personnalisez selon vos besoins
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'", // Autoriser inline pour SvelteKit
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self'",
            "connect-src 'self' https://your-supabase-url.supabase.co"
        ].join('; '),
    },
    
    // Password policy
    passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireDigit: true,
        requireSpecialChar: true,
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 jours en millisecondes
    },
    
    // Configuration de Sanitization
    sanitization: {
        allowHtml: false,
        allowedTags: [], // Vide = aucune balise autorisée
        allowedAttributes: {},
    }
};

export default SecurityConfig;