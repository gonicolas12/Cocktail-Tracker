// lib/auth.ts
import { supabase } from '$lib/supabase-server';
import type { User, UserLoginData, UserRegistrationData } from '$lib/types/user';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SESSION_EXPIRY_DAYS = 30;

/**
 * Enregistre un nouvel utilisateur
 */
export async function registerUser(userData: UserRegistrationData): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
        // Vérifier si l'utilisateur existe déjà
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${userData.email},username.eq.${userData.username}`)
            .limit(1);
            
        if (checkError) {
            return { success: false, error: `Erreur de vérification: ${checkError.message}` };
        }
        
        if (existingUsers && existingUsers.length > 0) {
            return { success: false, error: 'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà' };
        }
        
        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userData.password, salt);
        
        // Insérer le nouvel utilisateur
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                username: userData.username,
                email: userData.email,
                password_hash: passwordHash,
                created_at: new Date().toISOString()
            })
            .select('id, username, email, created_at')
            .single();
            
        if (insertError || !newUser) {
            return { success: false, error: `Erreur d'enregistrement: ${insertError?.message || 'Utilisateur non créé'}` };
        }
        
        return { success: true, user: newUser };
    } catch (e) {
        console.error('Exception d\'enregistrement:', e);
        return { success: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
    }
}

/**
 * Authentifie un utilisateur et crée une session
 */
export async function loginUser(loginData: UserLoginData, cookies: any): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
        // Récupérer l'utilisateur par email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, username, email, password_hash')
            .eq('email', loginData.email)
            .single();
            
        if (userError || !user) {
            return { success: false, error: 'Email ou mot de passe incorrect' };
        }
        
        // Vérifier le mot de passe
        const passwordValid = await bcrypt.compare(loginData.password, user.password_hash);
        
        if (!passwordValid) {
            return { success: false, error: 'Email ou mot de passe incorrect' };
        }
        
        // Créer un token de session
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
        
        // Enregistrer la session
        const { error: sessionError } = await supabase
            .from('sessions')
            .insert({
                token: sessionToken,
                user_id: user.id,
                created_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString()
            });
            
        if (sessionError) {
            return { success: false, error: `Erreur de session: ${sessionError.message}` };
        }
        
        // Définir le cookie de session
        cookies.set('session', sessionToken, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS, // En secondes
            sameSite: 'strict'
        });
        
        // Retourner l'utilisateur sans le hash de mot de passe
        const { password_hash, ...userWithoutPassword } = user;
        
        return { success: true, user: userWithoutPassword as User };
    } catch (e) {
        console.error('Exception de connexion:', e);
        return { success: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
    }
}

/**
 * Déconnecte l'utilisateur
 */
export async function logoutUser(token: string, cookies: any): Promise<{ success: boolean; error?: string }> {
    try {
        // Supprimer la session
        const { error } = await supabase
            .from('sessions')
            .delete()
            .eq('token', token);
            
        if (error) {
            console.error('Erreur lors de la suppression de la session:', error);
        }
        
        // Supprimer le cookie
        cookies.delete('session', { path: '/' });
        
        return { success: true };
    } catch (e) {
        console.error('Exception de déconnexion:', e);
        return { success: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
    }
}