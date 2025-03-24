import { supabase } from '$lib/supabase-server';
import { redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ cookies, locals }) => {
        const sessionToken = cookies.get('session');
        
        try {
            // Remove session from database if it exists
            if (sessionToken) {
                await supabase
                    .from('sessions')
                    .delete()
                    .eq('token', sessionToken);
            }
            
            // Clear session cookie
            cookies.delete('session', { path: '/' });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Redirect to login page
        throw redirect(303, '/login');
    }
};