<script lang="ts">
    type Cocktail = {
        id: number;
        title: string;
        ingredients: string[];
        likes: number;
        dislikes: number;
    };

    export let data: { cocktails: Cocktail[], error: string | null };
</script>

<main>
    <h1>Cocktail Tracker</h1>
    
    {#if data.error}
        <div style="background-color: #ffeeee; padding: 15px; border: 1px solid red; margin: 10px 0;">
            <h3>Erreur</h3>
            <p>{data.error}</p>
        </div>
    {/if}
    
    <div style="background-color: #f5f5f5; padding: 15px; border: 1px solid #ddd; margin: 10px 0;">
        <h3>Informations de débogage</h3>
        <p>Nombre de cocktails: {data.cocktails.length}</p>
        <details>
            <summary>Données brutes</summary>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </details>
    </div>
    
    {#if data.cocktails.length > 0}
        <ul>
            {#each data.cocktails as cocktail}
                <li>
                    <h2>{cocktail.title}</h2>
                    <p>Ingredients: {Array.isArray(cocktail.ingredients) ? cocktail.ingredients.join(', ') : 'Format inconnu'}</p>
                    <p>Likes: {cocktail.likes} | Dislikes: {cocktail.dislikes}</p>
                </li>
            {/each}
        </ul>
    {:else}
        <p>Aucun cocktail disponible.</p>
    {/if}
</main>

<style>
    main {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
    }
    
    ul {
        list-style-type: none;
        padding: 0;
    }
    
    li {
        border: 1px solid #ddd;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 5px;
    }
    
    h2 {
        margin-top: 0;
    }
</style>