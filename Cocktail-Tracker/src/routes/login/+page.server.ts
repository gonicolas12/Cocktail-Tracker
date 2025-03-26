import { supabase } from '$lib/supabase-server';
import { fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { hashPassword } from '$lib/auth';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        let emailOrUsername = '';
        
        try {
            const formData = await request.formData();
            emailOrUsername = formData.get('email') as string;
            const password = formData.get('password') as string;
            
            console.log('Tentative de connexion pour:', emailOrUsername);
            
            // Validation basique
            if (!emailOrUsername || !password) {
                return fail(400, { 
                    error: 'Email/Pseudo et mot de passe sont requis',
                    email: emailOrUsername
                });
            }
            
            // Requête pour trouver l'utilisateur
            const { data: users, error: queryError } = await supabase
                .from('users')
                .select('id, username, email, password')
                .or(`email.eq."${emailOrUsername}",username.eq."${emailOrUsername}"`);
            
            if (queryError) {
                console.error('Erreur SQL:', queryError);
                return fail(500, { 
                    error: 'Erreur lors de la recherche de l\'utilisateur',
                    email: emailOrUsername
                });
            }
            
            console.log('Résultats trouvés:', users?.length || 0);
            
            // Vérifier si on a trouvé un utilisateur
            if (!users || users.length === 0) {
                return fail(400, { 
                    error: 'Identifiants invalides',
                    email: emailOrUsername
                });
            }
            
            // Prendre le premier utilisateur correspondant
            const user = users[0];
            
            // Hacher le mot de passe saisi pour la comparaison
            const hashedPassword = hashPassword(password);
            
            console.log('Vérification du mot de passe');
            
            // Vérifier le mot de passe
            if (hashedPassword !== user.password) {
                return fail(400, { 
                    error: 'Identifiants invalides',
                    email: emailOrUsername
                });
            }
            
            console.log('Mot de passe validé, création de session');
            
            // Créer une session
            const sessionToken = crypto.randomUUID();
            
            try {
                // Supprimer les anciennes sessions de cet utilisateur
                await supabase
                    .from('sessions')
                    .delete()
                    .eq('user_id', user.id);
                
                // Ajouter la nouvelle session
                const { error: sessionError } = await supabase
                    .from('sessions')
                    .insert({
                        user_id: user.id,
                        token: sessionToken,
                        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    });
                
                if (sessionError) {
                    throw sessionError;
                }
            } catch (sessionErr) {
                console.error('Erreur session:', sessionErr);
                return fail(500, { 
                    error: 'Erreur lors de la création de la session',
                    email: emailOrUsername
                });
            }
            
            console.log('Définition du cookie');
            
            // Définir le cookie
            cookies.set('session', sessionToken, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 // 24 heures
            });
            
            // Retourner un indicateur de succès pour que le client puisse rediriger
            return {
                success: true,
                loginCompleted: true
            };
            
        } catch (err) {
            console.error('Exception générale:', err);
            
            return fail(500, { 
                error: err instanceof Error ? err.message : 'Erreur de connexion',
                email: emailOrUsername
            });
        }
    }
};