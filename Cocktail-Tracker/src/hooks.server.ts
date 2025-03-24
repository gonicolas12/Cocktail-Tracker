import { supabase } from '$lib/supabase-server';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
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
    } catch (error) {
        console.error('Erreur d\'authentification :', error);
        event.locals.user = null;
        return resolve(event);
    }
};