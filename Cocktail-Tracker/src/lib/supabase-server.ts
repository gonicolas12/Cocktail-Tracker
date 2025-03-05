import { createClient } from '@supabase/supabase-js'
import { env } from '$env/dynamic/private'

// Vérification pour s'assurer que les variables sont définies
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.error('Les variables d\'environnement SUPABASE_URL et SUPABASE_ANON_KEY doivent être définies');
}

// Client Supabase pour le code côté serveur
export const supabase = createClient(
  env.SUPABASE_URL || '',
  env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
)