import { supabase } from '$lib/supabase';

export async function load() {
    const { data, error } = await supabase
        .from('cocktails')
        .select('*');

    console.log('Data brute:', data);

    // Formater les données si nécessaire
    const formattedData = data?.map(cocktail => {
        // Si ingredients est une chaîne, la convertir en tableau
        if (typeof cocktail.ingredients === 'string') {
            try {
                cocktail.ingredients = JSON.parse(cocktail.ingredients);
            } catch (e) {
                // Si le JSON.parse échoue, essayer de traiter comme une chaîne
                cocktail.ingredients = cocktail.ingredients.split(',');
            }
        }
        return cocktail;
    });

    if (error) {
        console.error('Error:', error);
        return {
            cocktails: [],
            error: error.message
        };
    }

    return {
        cocktails: formattedData ?? [],
        error: null
    };
}