import { json } from '@sveltejs/kit';

// Types d'erreurs standardisés pour l'application
export enum ErrorType {
    // Erreurs génériques (4xx)
    BAD_REQUEST = 'BAD_REQUEST',          // 400
    UNAUTHORIZED = 'UNAUTHORIZED',         // 401
    FORBIDDEN = 'FORBIDDEN',               // 403
    NOT_FOUND = 'NOT_FOUND',               // 404
    CONFLICT = 'CONFLICT',                 // 409
    TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS', // 429
    
    // Erreurs d'authentification
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',    // 401
    SESSION_EXPIRED = 'SESSION_EXPIRED',            // 401
    
    // Erreurs de validation
    VALIDATION_ERROR = 'VALIDATION_ERROR',          // 400
    
    // Erreurs de base de données
    DATABASE_ERROR = 'DATABASE_ERROR',              // 500
    QUERY_ERROR = 'QUERY_ERROR',                    // 500
    
    // Erreurs serveur
    SERVER_ERROR = 'SERVER_ERROR',                  // 500
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',    // 503
}

// Structure d'erreur standardisée
export interface AppError {
    type: ErrorType;
    message: string;
    status: number;
    details?: Record<string, any>;
    stack?: string;
    // Propriétés requises pour la compatibilité avec Error
    name: string;
}

// Map des codes HTTP pour chaque type d'erreur
const ERROR_STATUS_CODES: Record<ErrorType, number> = {
    // 4xx
    [ErrorType.BAD_REQUEST]: 400,
    [ErrorType.UNAUTHORIZED]: 401,
    [ErrorType.FORBIDDEN]: 403,
    [ErrorType.NOT_FOUND]: 404,
    [ErrorType.CONFLICT]: 409,
    [ErrorType.TOO_MANY_REQUESTS]: 429,
    
    // Erreurs d'authentification (401)
    [ErrorType.INVALID_CREDENTIALS]: 401,
    [ErrorType.SESSION_EXPIRED]: 401,
    
    // Validation
    [ErrorType.VALIDATION_ERROR]: 400,
    
    // Base de données (500)
    [ErrorType.DATABASE_ERROR]: 500,
    [ErrorType.QUERY_ERROR]: 500,
    
    // Serveur
    [ErrorType.SERVER_ERROR]: 500,
    [ErrorType.SERVICE_UNAVAILABLE]: 503,
};

// Messages d'erreur utilisateur-friendly par défaut 
const DEFAULT_ERROR_MESSAGES: Record<ErrorType, string> = {
    [ErrorType.BAD_REQUEST]: 'Requête incorrecte',
    [ErrorType.UNAUTHORIZED]: 'Authentification requise',
    [ErrorType.FORBIDDEN]: 'Accès refusé',
    [ErrorType.NOT_FOUND]: 'Ressource introuvable',
    [ErrorType.CONFLICT]: 'Conflit avec l\'état actuel de la ressource',
    [ErrorType.TOO_MANY_REQUESTS]: 'Trop de requêtes, veuillez réessayer plus tard',
    
    [ErrorType.INVALID_CREDENTIALS]: 'Identifiants incorrects',
    [ErrorType.SESSION_EXPIRED]: 'Votre session a expiré, veuillez vous reconnecter',
    
    [ErrorType.VALIDATION_ERROR]: 'Données invalides',
    
    [ErrorType.DATABASE_ERROR]: 'Erreur de base de données',
    [ErrorType.QUERY_ERROR]: 'Erreur lors de la requête',
    
    [ErrorType.SERVER_ERROR]: 'Erreur serveur',
    [ErrorType.SERVICE_UNAVAILABLE]: 'Service temporairement indisponible',
};

// Créer une erreur d'application standardisée
export function createAppError(
    type: ErrorType,
    message?: string,
    details?: Record<string, any>,
    originalError?: Error
): AppError {
    const status = ERROR_STATUS_CODES[type] || 500;
    const errorMessage = message || DEFAULT_ERROR_MESSAGES[type];
    
    const appError: AppError = {
        type,
        message: errorMessage,
        status,
        details,
        name: `AppError.${type}` // Ajouter la propriété name pour compatibilité avec Error
    };
    
    // En mode développement, ajouter la stack trace
    if (process.env.NODE_ENV === 'development' && originalError) {
        appError.stack = originalError.stack;
        
        // Ajouter plus de détails en mode développement
        if (!appError.details) {
            appError.details = {};
        }
        
        appError.details.originalError = {
            name: originalError.name,
            message: originalError.message
        };
    }
    
    return appError;
}

// Journaliser l'erreur (peut être étendu pour intégrer des outils de monitoring)
export function logError(error: AppError | Error, context?: any) {
    // Vérifier si c'est une AppError
    const isAppError = 'type' in error && 'status' in error;
    
    // En production, on pourrait intégrer ici un service de logging comme Sentry
    if (process.env.NODE_ENV === 'production') {
        // TODO: Intégrer un service de logging
        if (isAppError) {
            const appError = error as AppError;
            console.error(`[ERROR] ${appError.type}: ${appError.message}`, {
                status: appError.status,
                details: appError.details,
                context
            });
        } else {
            console.error(`[ERROR] ${error.name}: ${error.message}`, {
                stack: error.stack,
                context
            });
        }
    } else {
        // Log détaillé en développement
        if (isAppError) {
            const appError = error as AppError;
            console.error(`[ERROR] ${appError.type}: ${appError.message}`, {
                status: appError.status,
                details: appError.details,
                stack: appError.stack,
                context
            });
        } else {
            console.error(`[ERROR] ${error.name}: ${error.message}`, {
                stack: error.stack,
                context
            });
        }
    }
}

// Handler d'erreur standardisé pour les routes API
export function handleApiError(error: Error | AppError, event?: any): Response {
    // Si c'est déjà une AppError, l'utiliser directement
    if ('type' in error && 'status' in error) {
        const appError = error as AppError;
        logError(appError, event);
        
        // Retourner la réponse JSON standardisée
        return json({
            error: appError.type,
            message: appError.message,
            ...(appError.details && process.env.NODE_ENV !== 'production' 
                ? { details: appError.details } : {})
        }, { status: appError.status });
    }
    
    // Sinon, convertir l'erreur en AppError
    const appError = createAppError(
        ErrorType.SERVER_ERROR,
        process.env.NODE_ENV !== 'production' ? error.message : undefined,
        undefined,
        error as Error // Cette conversion est nécessaire pour la compatibilité de type
    );
    
    logError(appError, event);
    
    return json({
        error: appError.type,
        message: appError.message
    }, { status: appError.status });
}

// Utilitaire pour vérifier si le corps d'une requête est valide
export function validateRequestBody<T>(
    body: any, 
    requiredFields: string[]
): { valid: boolean; error?: AppError } {
    // Vérifier que le corps existe
    if (!body) {
        return { 
            valid: false,
            error: createAppError(
                ErrorType.BAD_REQUEST,
                'Corps de requête manquant'
            )
        };
    }
    
    // Vérifier les champs requis
    const missingFields = requiredFields.filter(field => {
        const value = body[field];
        return value === undefined || value === null || value === '';
    });
    
    if (missingFields.length > 0) {
        return {
            valid: false,
            error: createAppError(
                ErrorType.VALIDATION_ERROR,
                `Champs manquants: ${missingFields.join(', ')}`,
                { missingFields }
            )
        };
    }
    
    return { valid: true };
}

// Capturer les erreurs Supabase et les convertir en AppError
export function handleSupabaseError(error: any): AppError {
    // Si c'est déjà une AppError, la retourner directement
    if ('type' in error && 'status' in error) {
        return error as AppError;
    }
    
    // Mapper les codes d'erreur Supabase à nos types d'erreur
    if (error.code) {
        switch (error.code) {
            case '23505': // Unique violation
                return createAppError(
                    ErrorType.CONFLICT,
                    'Une ressource avec ces données existe déjà',
                    { originalError: error }
                );
            case '23503': // Foreign key violation
                return createAppError(
                    ErrorType.BAD_REQUEST,
                    'Référence à une ressource inexistante',
                    { originalError: error }
                );
            // Ajouter d'autres codes d'erreur PostgreSQL au besoin
            default:
                return createAppError(
                    ErrorType.DATABASE_ERROR,
                    error.message || 'Erreur de base de données',
                    { originalError: error }
                );
        }
    }
    
    // Gérer les erreurs d'authentification Supabase
    if (error.message && error.message.includes('auth')) {
        return createAppError(
            ErrorType.UNAUTHORIZED,
            error.message,
            { originalError: error }
        );
    }
    
    // Erreur générique par défaut
    return createAppError(
        ErrorType.SERVER_ERROR,
        error.message || 'Une erreur est survenue',
        { originalError: error }
    );
}