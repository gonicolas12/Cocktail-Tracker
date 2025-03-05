import { supabase } from '$lib/supabase-server';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ request }: { request: Request }) => {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const ingredientsStr = formData.get('ingredients') as string;
        
        if (!title || !ingredientsStr) {
            return fail(400, { 
                error: 'Titre et ingrédients sont requis',
                title,
                ingredients: ingredientsStr
            });
        }
        
        // Convertir la chaîne d'ingrédients en tableau
        const ingredients = ingredientsStr
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);
            
        if (ingredients.length === 0) {
            return fail(400, { 
                error: 'Au moins un ingrédient est requis',
                title,
                ingredients: ingredientsStr
            });
        }
        
        try {
            const { error } = await supabase
                .from('cocktails')
                .insert({
                    title,
                    ingredients,
                    likes: 0,
                    dislikes: 0,
                    created_at: new Date().toISOString()
                });
                
            if (error) {
                return fail(500, { 
                    error: `Erreur lors de la création: ${error.message}`,
                    title,
                    ingredients: ingredientsStr
                });
            }
            
            // Redirection vers la page d'accueil
            throw redirect(303, '/');
        } catch (e) {
            console.error('Exception:', e);
            
            if (e instanceof Response) {
                throw e; // C'est une redirection
            }
            
            return fail(500, { 
                error: e instanceof Error ? e.message : 'Erreur inconnue',
                title,
                ingredients: ingredientsStr
            });
        }
    }
};