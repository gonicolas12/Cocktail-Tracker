import { supabase } from '$lib/supabase-server';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import bcrypt from 'bcrypt';

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
            // Find user by email or username
            const { data: user, error: findError } = await supabase
                .from('users')
                .select('*')
                .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
                .single();
            
            // Check for errors or user not found
            if (findError) {
                if (findError.code === 'PGRST116') {
                    // User not found
                    return fail(400, { 
                        error: 'Identifiants invalides',
                        email: emailOrUsername
                    });
                }
                throw findError;
            }
            
            // Verify password
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            
            if (!isPasswordCorrect) {
                return fail(400, { 
                    error: 'Identifiants invalides',
                    email: emailOrUsername
                });
            }
            
            // Create a session token (you might want to implement a more robust session management)
            const sessionToken = crypto.randomUUID();
            
            // Store session in Supabase or your preferred session management
            const { error: sessionError } = await supabase
                .from('sessions')
                .insert({
                    user_id: user.id,
                    token: sessionToken,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
                });
            
            if (sessionError) {
                throw sessionError;
            }
            
            // Set session cookie
            cookies.set('session', sessionToken, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 // 24 hours
            });
            
            // Redirect to home page
            throw redirect(303, '/');
        } catch (e) {
            console.error('Login exception:', e);
            
            if (e instanceof Response) {
                throw e; // It's a redirect
            }
            
            return fail(500, { 
                error: e instanceof Error ? e.message : 'Erreur de connexion',
                email: emailOrUsername
            });
        }
    }
};