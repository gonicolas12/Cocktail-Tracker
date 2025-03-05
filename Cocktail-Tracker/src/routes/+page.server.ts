import { supabase } from '$lib/supabase-server';

export async function load() {
    try {
        const { data, error } = await supabase
            .from('cocktails')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Erreur Supabase:', error);
            return {
                cocktails: [],
                error: `Erreur de chargement: ${error.message}`
            };
        }
        
        return {
            cocktails: data || [],
            error: null
        };
    } catch (e) {
        console.error('Exception:', e);
        return {
            cocktails: [],
            error: e instanceof Error ? e.message : 'Erreur inconnue'
        };
    }
}