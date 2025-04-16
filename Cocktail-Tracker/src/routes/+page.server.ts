import { supabase } from '$lib/supabase-server';
import type { RequestEvent } from '@sveltejs/kit';

// Définir une interface pour les votes utilisateur
interface UserVote {
    cocktail_id: number;
    vote_type: 'like' | 'dislike';
}

export async function load({ url, locals }: RequestEvent) {
    try {
        // Récupérer les paramètres de recherche et de tri
        const searchTerm = url.searchParams.get('search') || '';
        const sortBy = url.searchParams.get('sort') || 'likes'; // Par défaut: likes
        const direction = url.searchParams.get('dir') || 'desc'; // Par défaut: descendant
        
        // Construire la requête Supabase
        let query = supabase
            .from('cocktails')
            .select('*');
            
        // Appliquer la recherche si un terme est fourni
        if (searchTerm) {
            query = query.or(`title.ilike.%${searchTerm}%,ingredients.cs.{${searchTerm}}`)
        }
        
        // Appliquer le tri
        query = query.order(sortBy, { ascending: direction === 'asc' });
        
        // Exécuter la requête
        const { data, error } = await query;
            
        if (error) {
            console.error('Erreur Supabase:', error);
            return {
                cocktails: [],
                error: `Erreur de chargement: ${error.message}`,
                filters: { searchTerm, sortBy, direction }
            };
        }
        
        // Récupérer les votes de l'utilisateur si connecté
        let userVotes: UserVote[] = [];
        if (locals.user) {
            const { data: votes, error: votesError } = await supabase
                .from('cocktail_votes')
                .select('cocktail_id, vote_type')
                .eq('user_id', locals.user.id);
                
            if (!votesError && votes) {
                userVotes = votes as UserVote[];
            }
        }
        
        return {
            cocktails: data || [],
            userVotes,
            error: null,
            filters: { searchTerm, sortBy, direction }
        };
    } catch (e) {
        console.error('Exception:', e);
        return {
            cocktails: [],
            userVotes: [] as UserVote[],
            error: e instanceof Error ? e.message : 'Erreur inconnue',
            filters: { searchTerm: '', sortBy: 'likes', direction: 'desc' }
        };
    }
}