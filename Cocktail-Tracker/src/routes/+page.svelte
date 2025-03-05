<script lang="ts">
    type Cocktail = {
        id: number;
        title: string;
        ingredients: string[];
        likes: number;
        dislikes: number;
    };

    export let data: { 
        cocktails: Cocktail[], 
        error: string | null,
        debug?: any,
        exception?: string
    };
</script>

<main>
    <h1>Cocktail Tracker</h1>
    
    {#if data.error}
        <div style="background-color: #ffeeee; padding: 15px; border: 1px solid red; margin: 10px 0; border-radius: 5px;">
            <h3>⚠️ Erreur</h3>
            <p>{data.error}</p>
            {#if data.exception}
                <details>
                    <summary>Détails de l'exception</summary>
                    <pre style="background: #f8f8f8; padding: 10px; border-radius: 4px; overflow-x: auto;">{data.exception}</pre>
                </details>
            {/if}
        </div>
    {/if}
    
    <div style="background-color: #f5f5f5; padding: 15px; border: 1px solid #ddd; margin: 10px 0; border-radius: 5px;">
        <h3>🔍 Informations de débogage</h3>
        <p>État de connexion: {data.error ? '❌ Échec' : (data.cocktails?.length ? '✅ Succès' : '⚠️ Connecté mais aucune donnée')}</p>
        <p>Nombre de cocktails: {data.cocktails?.length || 0}</p>
        {#if data.debug}
            <details>
                <summary>Détails de débogage</summary>
                <pre style="background: #f8f8f8; padding: 10px; border-radius: 4px; overflow-x: auto;">{JSON.stringify(data.debug, null, 2)}</pre>
            </details>
        {/if}
        <details>
            <summary>Données brutes</summary>
            <pre style="background: #f8f8f8; padding: 10px; border-radius: 4px; overflow-x: auto;">{JSON.stringify(data, null, 2)}</pre>
        </details>
    </div>
    
    {#if data.cocktails && data.cocktails.length > 0}
        <h2>Liste des cocktails</h2>
        <ul style="list-style-type: none; padding: 0;">
            {#each data.cocktails as cocktail}
                <li style="background: white; margin-bottom: 15px; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3>{cocktail.title || 'Sans titre'}</h3>
                    <p><strong>Ingrédients:</strong> {Array.isArray(cocktail.ingredients) ? cocktail.ingredients.join(', ') : 'Format inconnu'}</p>
                    <div style="display: flex; gap: 15px;">
                        <span style="display: flex; align-items: center;">
                            <span style="margin-right: 5px;">👍</span> {cocktail.likes || 0}
                        </span>
                        <span style="display: flex; align-items: center;">
                            <span style="margin-right: 5px;">👎</span> {cocktail.dislikes || 0}
                        </span>
                    </div>
                </li>
            {/each}
        </ul>
    {:else}
        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; text-align: center; margin-top: 20px;">
            <p style="font-size: 1.2em;">Aucun cocktail disponible dans la base de données.</p>
            <p>Avez-vous ajouté des cocktails dans votre table Supabase?</p>
        </div>
    {/if}
</main>

<style>
    main {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
    }
    h1 {
        color: #333;
        border-bottom: 2px solid #ddd;
        padding-bottom: 10px;
    }
    pre {
        white-space: pre-wrap;
    }
</style>