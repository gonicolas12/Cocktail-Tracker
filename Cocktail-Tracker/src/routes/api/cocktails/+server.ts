import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

// GET all cocktails
export const GET = async () => {
    console.log('Fetching cocktails...');
    const { data, error } = await supabase
        .from('cocktails')
        .select('*');

    if (error) {
        console.error('Supabase error:', error);
        return json({ error: error.message }, { status: 500 });
    }

    console.log('Fetched data:', data);
    return json(data);
};

// POST a new cocktail
export const POST = async ({ request }: RequestEvent) => {
    const newCocktail = await request.json();
    
    const { data, error } = await supabase
        .from('cocktails')
        .insert([
            {
                title: newCocktail.title,
                ingredients: newCocktail.ingredients,
                likes: 0,
                dislikes: 0
            }
        ])
        .select()
        .single();

    if (error) {
        return json({ error: error.message }, { status: 500 });
    }

    return json(data, { status: 201 });
};