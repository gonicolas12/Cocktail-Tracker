import { supabase } from '$lib/supabase';

export async function load() {
    try {
        // Vérifiez d'abord que les variables d'environnement sont définies
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            return {
                cocktails: [],
                error: 'Variables d\'environnement Supabase manquantes'
            };
        }
        
        const { data, error } = await supabase
            .from('cocktails')
            .select('*');
        
        if (error) {
            return {
                cocktails: [],
                error: `Erreur Supabase: ${error.message}`
            };
        }
        
        return {
            cocktails: data || [],
            error: null
        };
    } catch (e) {
        return {
            cocktails: [],
            error: e instanceof Error ? e.message : 'Erreur inconnue'
        };
    }
}