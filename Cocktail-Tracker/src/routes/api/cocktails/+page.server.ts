import { supabase } from '$lib/supabase';

export async function load() {
    try {
        console.log('Chargement des données...');
        
        // Vérification des variables d'environnement
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log('Variables URL/KEY définies:', !!supabaseUrl, !!supabaseKey);
        
        if (!supabaseUrl || !supabaseKey) {
            return {
                cocktails: [],
                error: 'Configuration Supabase incomplète'
            };
        }
        
        // Requête Supabase
        const { data, error } = await supabase
            .from('cocktails')
            .select('*');
            
        console.log('Réponse Supabase:', { dataLength: data?.length, error });
            
        if (error) {
            return {
                cocktails: [],
                error: `Erreur Supabase: ${error.message}`
            };
        }
        
        return {
            cocktails: data || [],
            error: null,
            debug: {
                hasData: !!data,
                dataLength: data?.length || 0,
                supabaseUrlSet: !!supabaseUrl,
                supabaseKeySet: !!supabaseKey
            }
        };
    } catch (e) {
        console.error('Exception:', e);
        return {
            cocktails: [],
            error: e instanceof Error ? e.message : 'Erreur inconnue',
            exception: String(e)
        };
    }
}