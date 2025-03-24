import { supabase } from '$lib/supabase-server';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { hashPassword } from '$lib/auth';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        // Validation
        if (!username || !email || !password) {
            return fail(400, { 
                error: 'Tous les champs sont requis',
                username,
                email
            });
        }
        
        // Validate username length
        if (username.length < 3 || username.length > 50) {
            return fail(400, { 
                error: 'Le pseudo doit contenir entre 3 et 50 caractères',
                username,
                email
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return fail(400, { 
                error: 'Format d\'email invalide',
                username,
                email
            });
        }
        
        // Validate password length
        if (password.length < 8) {
            return fail(400, { 
                error: 'Le mot de passe doit contenir au moins 8 caractères',
                username,
                email
            });
        }
        
        try {
            // Check if email or username already exists
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('*')
                .or(`email.eq.${email},username.eq.${username}`)
                .single();
            
            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }
            
            if (existingUser) {
                if (existingUser.email === email) {
                    return fail(400, { 
                        error: 'Un compte avec cet email existe déjà',
                        username,
                        email
                    });
                }
                
                if (existingUser.username === username) {
                    return fail(400, { 
                        error: 'Ce pseudo est déjà utilisé',
                        username,
                        email
                    });
                }
            }
            
            // Hash the password
            const saltRounds = 10;
            const hashedPassword = hashPassword(password);
            
            // Insert new user
            const { error } = await supabase
                .from('users')
                .insert({
                    username,
                    email,
                    password: hashedPassword,
                    created_at: new Date().toISOString()
                });
            
            if (error) {
                return fail(500, { 
                    error: `Erreur lors de la création du compte: ${error.message}`,
                    username,
                    email
                });
            }
            
            // Redirect to login page
            throw redirect(303, '/login');
        } catch (e) {
            console.error('Exception:', e);
            
            if (e instanceof Response) {
                throw e; // C'est une redirection
            }
            
            return fail(500, { 
                error: e instanceof Error ? e.message : 'Erreur inconnue',
                username,
                email
            });
        }
    }
};