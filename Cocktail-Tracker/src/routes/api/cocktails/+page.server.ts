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
                error: 'Configuration Supabase incomplète',
                debug: { supabaseUrlSet: !!supabaseUrl, supabaseKeySet: !!supabaseKey }
            };
        }
        
        // Test de connexion basique
        console.log('Test de connexion à Supabase...');
        
        try {
            // Requête simple pour confirmer la connexion à la BD
            const { error: connError } = await supabase.from('cocktails').select('count');
            
            if (connError) {
                console.error('Erreur de connexion:', connError);
                return {
                    cocktails: [],
                    error: `Erreur de connexion: ${connError.message}`,
                    debug: { errorCode: connError.code, errorDetails: connError.details }
                };
            }
            
            console.log('Connexion établie avec succès');
        } catch (connEx) {
            console.error('Exception lors du test de connexion:', connEx);
            return {
                cocktails: [],
                error: 'Exception lors du test de connexion',
                exception: String(connEx)
            };
        }

        // Vérification directe des tables
        console.log('Liste des tables disponibles...');
        const { data: tableList, error: tableError } = await supabase
            .rpc('get_table_names'); // Procédure RPC intégrée pour lister les tables
            
        console.log('Tables disponibles:', tableList);
        if (tableError) {
            console.error('Erreur lors de la récupération des tables:', tableError);
        }
        
        // Vérifier les politiques RLS
        console.log('Vérification des politiques RLS...');
        const { data: policies, error: policyError } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'cocktails');
            
        console.log('Politiques pour cocktails:', policies);
        if (policyError) {
            console.error('Erreur lors de la vérification des politiques:', policyError);
        }
        
        // Liste des enregistrements avec une requête explicite
        console.log('Tentative explicite de récupération des cocktails...');
        
        const { data: allData, error: listError } = await supabase
            .from('cocktails')
            .select('*')
            .limit(100);
            
        console.log('Résultat de la requête explicite:', { dataLength: allData?.length });
        console.log('Premier enregistrement:', allData?.[0]);
        
        if (listError) {
            console.error('Erreur explicite:', listError);
            return {
                cocktails: [],
                error: `Erreur explicite: ${listError.message}`,
                debug: { 
                    errorCode: listError.code, 
                    errorDetails: listError.details 
                }
            };
        }
        
        // Requête Supabase principale
        console.log('Requête principale...');
        const { data, error } = await supabase
            .from('cocktails')
            .select('*');
            
        console.log('Réponse Supabase:', { dataLength: data?.length, error });
        
        if (data && data.length > 0) {
            console.log('Premier cocktail:', data[0]);
            console.log('Type d\'ingrédients:', typeof data[0].ingredients);
            console.log('Valeur d\'ingrédients:', data[0].ingredients);
        }
            
        if (error) {
            return {
                cocktails: [],
                error: `Erreur Supabase: ${error.message}`,
                debug: { 
                    error,
                    explicitQueryResult: {
                        success: !!allData,
                        length: allData?.length || 0
                    }
                }
            };
        }
        
        return {
            cocktails: data || [],
            error: null,
            debug: {
                hasData: !!data,
                dataLength: data?.length || 0,
                tableList,
                policies,
                explicitQueryResult: {
                    success: !!allData,
                    length: allData?.length || 0
                },
                firstItem: data?.[0] || null
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