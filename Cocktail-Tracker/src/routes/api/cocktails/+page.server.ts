import { supabase } from '$lib/supabase';

export async function load() {
    const { data, error } = await supabase
        .from('cocktails')
        .select('*');

    if (error) {
        console.error('Error:', error);
        return {
            cocktails: []
        };
    }

    return {
        cocktails: data ?? []
    };
}