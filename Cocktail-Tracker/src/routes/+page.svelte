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
        <p style="color: red;">Erreur: {data.error}</p>
    {/if}
    <ul>
        {#each data.cocktails as cocktail}
            <li>
                <h2>{cocktail.title}</h2>
                <p>Ingredients: {cocktail.ingredients.join(', ')}</p>
                <p>Likes: {cocktail.likes} | Dislikes: {cocktail.dislikes}</p>
            </li>
        {/each}
    </ul>
</main>
