<script lang="ts">
    import { onMount } from 'svelte';

    type Cocktail = {
        id: number;
        title: string;
        ingredients: string[];
        likes: number;
        dislikes: number;
    };

    let cocktails: Cocktail[] = [];

    onMount(async () => {
        const res = await fetch('/api/cocktails');
        cocktails = await res.json();
    });
</script>

<main>
    <h1>Cocktail Tracker</h1>
    <ul>
        {#each cocktails as cocktail}
            <li>
                <h2>{cocktail.title}</h2>
                <p>Ingredients: {cocktail.ingredients.join(', ')}</p>
                <p>Likes: {cocktail.likes} | Dislikes: {cocktail.dislikes}</p>
            </li>
        {/each}
    </ul>
</main>
