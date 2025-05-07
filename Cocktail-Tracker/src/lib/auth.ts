import { supabase } from '$lib/supabase-server';
import type { User, UserLoginData, UserRegistrationData } from '$lib/types/user';
import crypto from 'crypto';
import { sanitizeString, sanitizeEmail } from '$lib/utils/input-sanitizer';
import { createAppError, ErrorType } from '$lib/utils/error-handler';

const SESSION_EXPIRY_DAYS = 30;

// Fonction pour hacher le mot de passe avec SHA-256 et un sel
function hashPassword(password: string, salt: string = ''): string {
    // Utiliser un sel unique pour chaque utilisateur
    // Si un sel n'est pas fourni, en générer un nouveau
    const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
    
    // Hacher le mot de passe avec le sel
    const hashedPassword = crypto
        .createHmac('sha256', passwordSalt)
        .update(password)
        .digest('hex');
    
    // Format: passwordHash:salt
    return `${hashedPassword}:${passwordSalt}`;
}

// Vérifier le mot de passe
function verifyPassword(password: string, hashedPassword: string): boolean {
    // Format attendu: hash:salt
    const [hash, salt] = hashedPassword.split(':');
    
    // Si pas de sel (ancien format), utiliser l'ancienne méthode
    if (!salt) {
        const oldHash = crypto.createHash('sha256').update(password).digest('hex');
        return oldHash === hashedPassword;
    }
    
    // Sinon, vérifier avec le sel
    const newHashedPassword = hashPassword(password, salt);
    return newHashedPassword === hashedPassword;
}

// Valider la complexité du mot de passe
function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
    }
    
    // Vérifier la présence d'au moins une lettre majuscule
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins une lettre majuscule' };
    }
    
    // Vérifier la présence d'au moins une lettre minuscule
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins une lettre minuscule' };
    }
    
    // Vérifier la présence d'au moins un chiffre
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
    }
    
    // Vérifier la présence d'au moins un caractère spécial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial' };
    }
    
    return { valid: true };
}

// Fonction pour générer un token de session sécurisé
function generateSessionToken(): string {
    return crypto.randomBytes(48).toString('hex');
}

export async function registerUser(userData: UserRegistrationData): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
        // Sanitiser les entrées
        const sanitizedUsername = sanitizeString(userData.username);
        const sanitizedEmail = sanitizeEmail(userData.email);
        const password = userData.password; // Le mot de passe n'est pas sanitisé, mais validé
        
        // Valider le nom d'utilisateur
        if (!sanitizedUsername || sanitizedUsername.length < 3) {
            return { 
                success: false, 
                error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' 
            };
        }
        
        // Valider l'email
        if (!sanitizedEmail) {
            return { 
                success: false, 
                error: 'Email invalide' 
            };
        }
        
        // Valider la complexité du mot de passe
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            return { 
                success: false, 
                error: passwordValidation.message || 'Mot de passe trop faible' 
            };
        }
        
        // Vérifier si l'utilisateur existe déjà
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${sanitizedEmail},username.eq.${sanitizedUsername}`)
            .limit(1);
            
        if (checkError) {
            console.error("Erreur lors de la vérification de l'utilisateur:", checkError);
            return { success: false, error: `Erreur de vérification: ${checkError.message}` };
        }
        
        if (existingUsers && existingUsers.length > 0) {
            return { success: false, error: 'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà' };
        }
        
        // Hasher le mot de passe avec notre nouvelle méthode
        const passwordHash = hashPassword(password);
        
        // Insérer le nouvel utilisateur
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                username: sanitizedUsername,
                email: sanitizedEmail,
                password: passwordHash,
                created_at: new Date().toISOString()
            })
            .select('id, username, email, created_at')
            .single();
            
        if (insertError || !newUser) {
            console.error("Erreur lors de l'insertion de l'utilisateur:", insertError);
            return { success: false, error: `Erreur d'enregistrement: ${insertError?.message || 'Utilisateur non créé'}` };
        }
        
        return { success: true, user: newUser };
    } catch (e) {
        console.error('Exception d\'enregistrement:', e);
        return { success: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
    }
}

// Authentifie un utilisateur et crée une session
export async function loginUser(loginData: UserLoginData, cookies: any): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
        // Sanitiser l'email
        const sanitizedEmail = sanitizeEmail(loginData.email);
        const password = loginData.password;
        
        if (!sanitizedEmail) {
            return { success: false, error: 'Email invalide' };
        }
        
        // Récupérer l'utilisateur par email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, username, email, password')
            .eq('email', sanitizedEmail)
            .single();
            
        if (userError || !user) {
            // Pour des raisons de sécurité, ne pas indiquer si l'email existe ou non
            return { success: false, error: 'Email ou mot de passe incorrect' };
        }
        
        // Vérifier le mot de passe
        const passwordValid = verifyPassword(password, user.password);
        
        if (!passwordValid) {
            // Ajouter un délai aléatoire pour prévenir le timing attack
            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
            return { success: false, error: 'Email ou mot de passe incorrect' };
        }
        
        // Créer un token de session sécurisé
        const sessionToken = generateSessionToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
        
        // Enregistrer la session
        const { error: sessionError } = await supabase
            .from('sessions')
            .insert({
                token: sessionToken,
                user_id: user.id,
                created_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
                ip_address: 'client_ip', // À remplacer par l'IP réelle du client
                user_agent: 'user_agent' // À remplacer par le user-agent réel
            });
            
        if (sessionError) {
            console.error("Erreur lors de la création de la session:", sessionError);
            return { success: false, error: `Erreur de session: ${sessionError.message}` };
        }
        
        // Définir le cookie de session avec des options de sécurité
        cookies.set('session', sessionToken, {
            path: '/',
            httpOnly: true, // Empêche l'accès via JavaScript
            secure: process.env.NODE_ENV === 'production', // HTTPS seulement en production
            maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS, // En secondes
            sameSite: 'strict', // Protection CSRF
            domain: process.env.COOKIE_DOMAIN || undefined // Domaine du cookie
        });
        
        // Retourner l'utilisateur sans le mot de passe
        const { password: _, ...userWithoutPassword } = user;
        
        return { success: true, user: userWithoutPassword as User };
    } catch (e) {
        console.error('Exception de connexion:', e);
        return { success: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
    }
}

// Déconnecte l'utilisateur
export async function logoutUser(token: string, cookies: any): Promise<{ success: boolean; error?: string }> {
    try {
        // Sanitiser le token
        const sanitizedToken = sanitizeString(token);
        
        if (!sanitizedToken) {
            return { success: false, error: 'Token de session invalide' };
        }
        
        console.log("Déconnexion de l'utilisateur avec token:", sanitizedToken.substring(0, 10) + "...");
        
        // Supprimer la session
        const { error } = await supabase
            .from('sessions')
            .delete()
            .eq('token', sanitizedToken);
            
        if (error) {
            console.error('Erreur lors de la suppression de la session:', error);
        }
        
        // Supprimer le cookie avec des options de sécurité
        cookies.delete('session', { 
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        console.log("Cookie de session supprimé");
        
        return { success: true };
    } catch (e) {
        console.error('Exception de déconnexion:', e);
        return { success: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
    }
}