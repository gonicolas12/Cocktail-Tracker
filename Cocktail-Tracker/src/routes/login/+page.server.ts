import { supabase } from '$lib/supabase-server';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { hashPassword } from '$lib/auth';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const emailOrUsername = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        // Validation
        if (!emailOrUsername || !password) {
            return fail(400, { 
                error: 'Email/Pseudo et mot de passe sont requis',
                email: emailOrUsername
            });
        }
        
        try {
            // Approche alternative: deux requêtes distinctes pour éviter les problèmes de syntaxe
            let userData;
            
            // D'abord, essayer de trouver par email
            const { data: userByEmail, error: emailError } = await supabase
                .from('users')
                .select('*')
                .eq('email', emailOrUsername)
                .maybeSingle();
                
            if (emailError && emailError.code !== 'PGRST116') {
                console.error('Erreur recherche par email:', emailError);
                throw emailError;
            }
            
            if (userByEmail) {
                userData = userByEmail;
            } else {
                // Sinon, essayer de trouver par username
                const { data: userByUsername, error: usernameError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('username', emailOrUsername)
                    .maybeSingle();
                    
                if (usernameError && usernameError.code !== 'PGRST116') {
                    console.error('Erreur recherche par username:', usernameError);
                    throw usernameError;
                }
                
                userData = userByUsername;
            }
            
            // Si aucun utilisateur n'est trouvé
            if (!userData) {
                return fail(400, { 
                    error: 'Identifiants invalides',
                    email: emailOrUsername
                });
            }
            
            // Vérifier le mot de passe (approche simplifiée)
            const hashedInputPassword = hashPassword(password);
            if (hashedInputPassword !== userData.password) {
                return fail(400, { 
                    error: 'Identifiants invalides',
                    email: emailOrUsername
                });
            }
            
            // Créer un token de session
            const sessionToken = crypto.randomUUID();
            
            // Stocker la session dans Supabase
            const { error: sessionError } = await supabase
                .from('sessions')
                .insert({
                    user_id: userData.id,
                    token: sessionToken,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
                });
            
            if (sessionError) {
                console.error('Erreur de création de session:', sessionError);
                throw sessionError;
            }
            
            // Définir le cookie de session
            cookies.set('session', sessionToken, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 // 24 hours
            });
            
            // Rediriger vers la page d'accueil
            throw redirect(303, '/');
        } catch (e) {
            console.error('Exception de connexion:', e);
            
            if (e instanceof Response) {
                throw e; // C'est une redirection
            }
            
            return fail(500, { 
                error: e instanceof Error ? e.message : 'Erreur de connexion',
                email: emailOrUsername
            });
        }
    }
};