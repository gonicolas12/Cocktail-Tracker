import { supabase } from '$lib/supabase';

export async function load() {
    try {
        // Extraction simplifiée des données
        const { data, error } = await supabase
            .from('cocktails')
            .select('*');
        
        if (error) {
            console.error('Erreur Supabase:', error);
            return {
                cocktails: [],
                error: error.message
            };
        }
        
        // Aucune conversion n'est nécessaire pour le type text[]
        // PostgreSQL envoie déjà les données comme un tableau JavaScript
        
        return {
            cocktails: data || [],
            error: null
        };
    } catch (e) {
        console.error('Exception générale:', e);
        return {
            cocktails: [],
            error: e instanceof Error ? e.message : 'Erreur inconnue'
        };
    }
}