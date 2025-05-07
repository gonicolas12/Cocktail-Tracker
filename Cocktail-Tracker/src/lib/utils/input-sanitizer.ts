// Sanitiser les chaînes de caractères pour éviter les attaques XSS
export function sanitizeString(input: string | null | undefined): string {
    if (input === null || input === undefined) {
        return '';
    }
    
    // Convertir en chaîne si ce n'est pas déjà le cas
    const stringInput = String(input);
    
    // Échapper les caractères spéciaux HTML
    return stringInput
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Sanitiser un objet entier récursivement
export function sanitizeObject<T extends object>(obj: T): T {
    const result = { ...obj };
    
    for (const key in result) {
        const value = result[key];
        
        if (value === null || value === undefined) {
            continue;
        }
        
        if (typeof value === 'string') {
            // Sanitiser les chaînes de caractères
            result[key] = sanitizeString(value) as any;
        } else if (Array.isArray(value)) {
            // Sanitiser récursivement les tableaux
            result[key] = value.map(item => 
                typeof item === 'string' 
                    ? sanitizeString(item) 
                    : typeof item === 'object' && item !== null
                        ? sanitizeObject(item)
                        : item
            ) as any;
        } else if (typeof value === 'object') {
            // Sanitiser récursivement les objets
            result[key] = sanitizeObject(value) as any;
        }
    }
    
    return result;
}

// Nettoyer et valider une adresse email
export function sanitizeEmail(email: string | null | undefined): string {
    if (!email) return '';
    
    // Sanitiser la chaîne d'abord
    const sanitized = sanitizeString(email).trim().toLowerCase();
    
    // Vérifier le format d'email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
        return ''; // Retourner une chaîne vide si le format est invalide
    }
    
    return sanitized;
}

// Sanitiser les données de formulaire
export async function sanitizeFormData(formData: FormData): Promise<FormData> {
    const sanitizedData = new FormData();
    
    for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
            sanitizedData.append(key, sanitizeString(value));
        } else {
            // Pour les fichiers ou autres types, laisser tels quels
            sanitizedData.append(key, value);
        }
    }
    
    return sanitizedData;
}

// Valider et sanitiser une liste d'ingrédients
export function sanitizeIngredients(ingredients: string): string[] {
    if (!ingredients) return [];
    
    // Sanitiser la chaîne entière d'abord
    const sanitized = sanitizeString(ingredients);
    
    // Diviser en tableau, nettoyer chaque élément et filtrer les éléments vides
    return sanitized
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
}