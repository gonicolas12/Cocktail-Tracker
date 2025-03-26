import { supabase } from '$lib/supabase-server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, locals, request }) => {
    // Vérifier si l'utilisateur est connecté
    if (!locals.user) {
        return json({ success: false, message: 'Vous devez être connecté pour voter' }, { status: 401 });
    }
    
    try {
        const body = await request.json();
        const voteType = body.voteType; // 'like' ou 'dislike'
        
        if (voteType !== 'like' && voteType !== 'dislike') {
            return json({ success: false, message: 'Type de vote invalide' }, { status: 400 });
        }
        
        const cocktailId = params.id;
        const userId = locals.user.id;
        
        // Récupérer les données actuelles du cocktail
        const { data: cocktail, error: cocktailError } = await supabase
            .from('cocktails')
            .select('likes, dislikes')
            .eq('id', cocktailId)
            .single();
            
        if (cocktailError) {
            return json({ success: false, message: 'Cocktail non trouvé' }, { status: 404 });
        }
        
        const currentLikes = cocktail.likes || 0;
        const currentDislikes = cocktail.dislikes || 0;
        
        // Vérifier si l'utilisateur a déjà voté
        const { data: existingVote, error: voteError } = await supabase
            .from('cocktail_votes')
            .select('vote_type')
            .eq('user_id', userId)
            .eq('cocktail_id', cocktailId)
            .maybeSingle();
            
        if (voteError && voteError.code !== 'PGRST116') {
            return json({ success: false, message: 'Erreur lors de la vérification du vote' }, { status: 500 });
        }
        
        let newLikes = currentLikes;
        let newDislikes = currentDislikes;
        
        if (!existingVote) {
            // Cas 1: Ajouter un nouveau vote
            await supabase
                .from('cocktail_votes')
                .insert({
                    user_id: userId,
                    cocktail_id: cocktailId,
                    vote_type: voteType
                });
                
            if (voteType === 'like') {
                newLikes += 1;
            } else {
                newDislikes += 1;
            }
        } else if (existingVote.vote_type === voteType) {
            // Cas 2: Supprimer le vote existant (annulation du vote)
            await supabase
                .from('cocktail_votes')
                .delete()
                .eq('user_id', userId)
                .eq('cocktail_id', cocktailId);
                
            if (voteType === 'like') {
                newLikes = Math.max(currentLikes - 1, 0);
            } else {
                newDislikes = Math.max(currentDislikes - 1, 0);
            }
        } else {
            // Cas 3: Changer le type de vote
            await supabase
                .from('cocktail_votes')
                .update({ vote_type: voteType })
                .eq('user_id', userId)
                .eq('cocktail_id', cocktailId);
                
            if (voteType === 'like') {
                newLikes += 1;
                newDislikes = Math.max(currentDislikes - 1, 0);
            } else {
                newDislikes += 1;
                newLikes = Math.max(currentLikes - 1, 0);
            }
        }
        
        // Mettre à jour les compteurs dans la table cocktails
        await supabase
            .from('cocktails')
            .update({
                likes: newLikes,
                dislikes: newDislikes
            })
            .eq('id', cocktailId);
            
        return json({
            success: true,
            likes: newLikes,
            dislikes: newDislikes,
            userVote: existingVote?.vote_type === voteType ? null : voteType
        });
    } catch (error) {
        console.error('Erreur de vote:', error);
        return json({ success: false, message: 'Erreur serveur' }, { status: 500 });
    }
};