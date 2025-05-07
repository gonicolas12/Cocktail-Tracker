import { supabase } from '$lib/supabase-server';
import { protectRoute } from '$lib/auth-protect';
import { fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import crypto from 'crypto';

// Fonction pour hacher le mot de passe avec SHA-256
function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Protection de la route - nécessite d'être connecté
export const load = async (event) => {
    // Utiliser le middleware de protection
    const data = protectRoute(event);
    
    if (!data.user) {
        return data; // La redirection sera gérée par protectRoute
    }
    
    console.log("Utilisateur connecté:", data.user); // Debug
    
    // Récupérer les cocktails de l'utilisateur
    const { data: userCocktails, error: cocktailsError } = await supabase
        .from('cocktails')
        .select('*')
        .eq('created_by', data.user.id)
        .order('created_at', { ascending: false });
        
    console.log("Cocktails de l'utilisateur:", { data: userCocktails, error: cocktailsError }); // Debug
        
    // Récupérer les votes de l'utilisateur
    const { data: userVotes, error: votesError } = await supabase
        .from('cocktail_votes')
        .select(`
            vote_type,
            cocktail_id,
            cocktails (*)
        `)
        .eq('user_id', data.user.id);
        
    console.log("Votes de l'utilisateur:", { data: userVotes, error: votesError }); // Debug
        
    // Filtrer les votes par type
    const likedCocktails = userVotes
        ?.filter(vote => vote.vote_type === 'like')
        .map(vote => vote.cocktails) || [];
        
    const dislikedCocktails = userVotes
        ?.filter(vote => vote.vote_type === 'dislike')
        .map(vote => vote.cocktails) || [];
        
    return {
        user: data.user,
        userCocktails: userCocktails || [],
        likedCocktails,
        dislikedCocktails,
        errors: {
            cocktails: cocktailsError ? cocktailsError.message : null,
            votes: votesError ? votesError.message : null
        }
    };
};

export const actions: Actions = {
    // Action pour mettre à jour le profil utilisateur
    updateProfile: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { success: false, error: 'Non autorisé' });
        }
        
        const formData = await request.formData();
        const username = formData.get('username') as string;
        
        if (!username || username.trim() === '') {
            return fail(400, { 
                success: false, 
                error: 'Le nom d\'utilisateur ne peut pas être vide',
                username: locals.user.username
            });
        }
        
        try {
            // Vérifier si le nom d'utilisateur est déjà pris (par un autre utilisateur)
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('username', username)
                .neq('id', locals.user.id)
                .maybeSingle();
                
            if (checkError) {
                return fail(500, { 
                    success: false, 
                    error: `Erreur lors de la vérification: ${checkError.message}`,
                    username: locals.user.username
                });
            }
            
            if (existingUser) {
                return fail(400, { 
                    success: false, 
                    error: 'Ce nom d\'utilisateur est déjà utilisé',
                    username: locals.user.username
                });
            }
            
            // Mettre à jour le nom d'utilisateur
            const { error: updateError } = await supabase
                .from('users')
                .update({ username })
                .eq('id', locals.user.id);
                
            if (updateError) {
                return fail(500, { 
                    success: false, 
                    error: `Erreur lors de la mise à jour: ${updateError.message}`,
                    username: locals.user.username
                });
            }
            
            // Mettre à jour les références dans la table cocktails
            await supabase
                .from('cocktails')
                .update({ user_username: username })
                .eq('created_by', locals.user.id);
                
            return { 
                success: true, 
                message: 'Profil mis à jour avec succès',
                username
            };
        } catch (e) {
            console.error('Exception:', e);
            
            return fail(500, { 
                success: false, 
                error: e instanceof Error ? e.message : 'Erreur inconnue',
                username: locals.user.username
            });
        }
    },
     // Nouvelle action pour changer le mot de passe
     changePassword: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { passwordSuccess: false, passwordError: 'Non autorisé' });
        }
        
        const formData = await request.formData();
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        
        // Validation de base
        if (!currentPassword || !newPassword || !confirmPassword) {
            return fail(400, { 
                passwordSuccess: false, 
                passwordError: 'Tous les champs sont requis'
            });
        }
        
        if (newPassword !== confirmPassword) {
            return fail(400, { 
                passwordSuccess: false, 
                passwordError: 'Les mots de passe ne correspondent pas'
            });
        }
        
        if (newPassword.length < 6) {
            return fail(400, { 
                passwordSuccess: false, 
                passwordError: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
            });
        }
        
        try {
            // Récupérer le mot de passe actuel de l'utilisateur
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('password')
                .eq('id', locals.user.id)
                .single();
                
            if (userError || !user) {
                return fail(500, { 
                    passwordSuccess: false, 
                    passwordError: 'Erreur lors de la récupération du profil'
                });
            }
            
            // Vérifier que le mot de passe actuel est correct
            const hashedCurrentPassword = hashPassword(currentPassword);
            if (hashedCurrentPassword !== user.password) {
                return fail(400, { 
                    passwordSuccess: false, 
                    passwordError: 'Mot de passe actuel incorrect'
                });
            }
            
            // Hasher le nouveau mot de passe
            const hashedNewPassword = hashPassword(newPassword);
            
            // Mettre à jour le mot de passe
            const { error: updateError } = await supabase
                .from('users')
                .update({ password: hashedNewPassword })
                .eq('id', locals.user.id);
                
            if (updateError) {
                return fail(500, { 
                    passwordSuccess: false, 
                    passwordError: `Erreur lors de la mise à jour: ${updateError.message}`
                });
            }
            
            return { 
                passwordSuccess: true, 
                passwordMessage: 'Mot de passe mis à jour avec succès'
            };
        } catch (e) {
            console.error('Exception lors du changement de mot de passe:', e);
            
            return fail(500, { 
                passwordSuccess: false, 
                passwordError: e instanceof Error ? e.message : 'Erreur inconnue'
            });
        }
    }
};