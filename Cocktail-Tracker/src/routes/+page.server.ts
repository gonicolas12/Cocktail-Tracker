import { supabase } from '$lib/supabase-server';
import type { RequestEvent } from '@sveltejs/kit';

interface UserVote {
    cocktail_id: number;
    vote_type: 'like' | 'dislike';
}

export async function load({ url }: RequestEvent) {
    try {
        // Récupérer les paramètres de recherche et de tri
        const searchTerm = url.searchParams.get('search') || '';
        const sortBy = url.searchParams.get('sort') || 'created_at';
        const direction = url.searchParams.get('dir') || 'desc';
        
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
        
        // Si l'utilisateur est connecté, récupérer ses votes
        let userVotes: UserVote[] = [];
        if (url.searchParams.get('userId')) {
            const userId = url.searchParams.get('userId');
            const { data: votes, error: votesError } = await supabase
                .from('cocktail_votes')
                .select('cocktail_id, vote_type')
                .eq('user_id', userId);
                
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
            filters: { searchTerm: '', sortBy: 'created_at', direction: 'desc' }
        };
    }
}