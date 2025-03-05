import { supabase } from '$lib/supabase';
import { dev } from '$app/environment';

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
                error: 'Configuration Supabase incomplète: variables d\'environnement manquantes',
                debug: {
                    supabaseUrlSet: !!supabaseUrl,
                    supabaseKeySet: !!supabaseKey,
                    envKeys: dev ? Object.keys(import.meta.env) : 'non affiché en production'
                }
            };
        }
        
        // Vérifier la connexion à Supabase
        try {
            const { data: healthCheck, error: healthError } = await supabase.from('cocktails').select('count');
            
            if (healthError) {
                return {
                    cocktails: [],
                    error: `Erreur de connexion Supabase: ${healthError.message}`,
                    debug: {
                        healthError,
                        supabaseUrlPartial: supabaseUrl.substring(0, 12) + '...',
                        supabaseKeyLength: supabaseKey.length
                    }
                };
            }
            
            console.log('Connexion Supabase OK, health check:', healthCheck);
        } catch (healthEx) {
            return {
                cocktails: [],
                error: 'Erreur lors du test de connexion à Supabase',
                exception: String(healthEx)
            };
        }
        
        // Requête Supabase principale
        const { data, error } = await supabase
            .from('cocktails')
            .select('*');
            
        console.log('Réponse Supabase:', { dataLength: data?.length, error });
            
        if (error) {
            return {
                cocktails: [],
                error: `Erreur Supabase: ${error.message}`,
                debug: { error }
            };
        }
        
        // Vérifier les données
        if (!data || data.length === 0) {
            return {
                cocktails: [],
                error: null,
                debug: {
                    message: "Aucune erreur, mais aucune donnée trouvée dans la table 'cocktails'",
                    hasData: !!data,
                    dataLength: data?.length || 0
                }
            };
        }
        
        return {
            cocktails: data,
            error: null,
            debug: {
                hasData: !!data,
                dataLength: data.length,
                firstItem: data[0],
                supabaseUrlSet: !!supabaseUrl,
                supabaseKeySet: !!supabaseKey
            }
        };
    } catch (e) {
        console.error('Exception:', e);
        return {
            cocktails: [],
            error: e instanceof Error ? e.message : 'Erreur inconnue',
            exception: String(e),
            debug: { type: typeof e }
        };
    }
}