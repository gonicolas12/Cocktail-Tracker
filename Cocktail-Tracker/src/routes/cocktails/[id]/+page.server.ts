import { supabase } from '$lib/supabase-server';
import { error } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { isResourceOwner } from '$lib/auth-protect';

export async function load({ params, locals }) {
    const cocktailId = params.id;
    
    try {
        // Récupérer les détails du cocktail
        const { data: cocktail, error: cocktailError } = await supabase
            .from('cocktails')
            .select('*')
            .eq('id', cocktailId)
            .single();
            
        if (cocktailError) {
            throw error(404, 'Cocktail non trouvé');
        }
        
        // Récupérer les commentaires du cocktail
        const { data: comments, error: commentsError } = await supabase
            .from('cocktail_comments')
            .select(`
                id,
                content,
                created_at,
                user_id,
                users (
                    username
                )
            `)
            .eq('cocktail_id', cocktailId)
            .order('created_at', { ascending: false });
            
        if (commentsError) {
            console.error('Erreur de récupération des commentaires:', commentsError);
        }
        
        // Vérifier si l'utilisateur a voté pour ce cocktail
        let userVote = null;
        if (locals.user) {
            const { data: vote, error: voteError } = await supabase
                .from('cocktail_votes')
                .select('vote_type')
                .eq('user_id', locals.user.id)
                .eq('cocktail_id', cocktailId)
                .maybeSingle();
                
            if (!voteError && vote) {
                userVote = vote.vote_type;
            }
        }
        
        // Vérifier si l'utilisateur est le propriétaire du cocktail
        const isOwner = locals.user ? isResourceOwner(locals.user.id, cocktail.created_by || null) : false;
        
        return {
            cocktail,
            comments: comments || [],
            userVote,
            isOwner
        };
    } catch (e) {
        console.error('Exception:', e);
        throw error(500, e instanceof Error ? e.message : 'Erreur inconnue');
    }
}

export const actions: Actions = {
    // Action pour ajouter un commentaire
    addComment: async ({ request, locals, params }) => {
        // Vérifier si l'utilisateur est connecté
        if (!locals.user) {
            return { success: false, error: 'Vous devez être connecté pour commenter' };
        }
        
        const formData = await request.formData();
        const content = formData.get('content') as string;
        const cocktailId = params.id;
        
        if (!content || content.trim() === '') {
            return { success: false, error: 'Le commentaire ne peut pas être vide' };
        }
        
        try {
            const { error: commentError } = await supabase
                .from('cocktail_comments')
                .insert({
                    cocktail_id: cocktailId,
                    user_id: locals.user.id,
                    content: content.trim(),
                    created_at: new Date().toISOString()
                });
                
            if (commentError) {
                return { 
                    success: false, 
                    error: `Erreur lors de l'ajout du commentaire: ${commentError.message}` 
                };
            }
            
            return { success: true };
        } catch (e) {
            console.error('Exception:', e);
            return { 
                success: false, 
                error: e instanceof Error ? e.message : 'Erreur inconnue' 
            };
        }
    },
    
    // Action pour supprimer un cocktail
    deleteRecipe: async ({ params, locals }) => {
        if (!locals.user) {
            return { success: false, error: 'Vous devez être connecté pour supprimer un cocktail' };
        }
        
        const cocktailId = params.id;
        
        // Vérifier que l'utilisateur est le propriétaire du cocktail
        const { data: cocktail, error: cocktailError } = await supabase
            .from('cocktails')
            .select('created_by')
            .eq('id', cocktailId)
            .single();
            
        if (cocktailError) {
            return { success: false, error: 'Cocktail non trouvé' };
        }
        
        if (cocktail.created_by !== locals.user.id) {
            return { success: false, error: 'Vous ne pouvez supprimer que vos propres cocktails' };
        }
        
        try {
            // Supprimer tous les votes liés à ce cocktail
            await supabase
                .from('cocktail_votes')
                .delete()
                .eq('cocktail_id', cocktailId);
                
            // Supprimer tous les commentaires liés à ce cocktail
            await supabase
                .from('cocktail_comments')
                .delete()
                .eq('cocktail_id', cocktailId);
                
            // Enfin, supprimer le cocktail
            const { error: deleteError } = await supabase
                .from('cocktails')
                .delete()
                .eq('id', cocktailId);
                
            if (deleteError) {
                return { 
                    success: false, 
                    error: `Erreur lors de la suppression: ${deleteError.message}` 
                };
            }
            
            return { 
                success: true, 
                redirect: '/',
                message: 'Cocktail supprimé avec succès!'
            };
        } catch (e) {
            console.error('Exception:', e);
            return { 
                success: false, 
                error: e instanceof Error ? e.message : 'Erreur inconnue' 
            };
        }
    }
};