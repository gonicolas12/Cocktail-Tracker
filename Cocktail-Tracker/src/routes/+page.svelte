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
    let error: string | null = null;

    onMount(async () => {
        try {
            const res = await fetch('/api/cocktails');
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Erreur lors du chargement des cocktails');
            }
            cocktails = await res.json();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Une erreur est survenue';
        }
    });
</script>

<main>
    <h1>Cocktail Tracker</h1>
    {#if error}
        <p class="error">{error}</p>
    {:else}
        <ul>
            {#each cocktails as cocktail}
                <li>
                    <h2>{cocktail.title}</h2>
                    <p>Ingredients: {cocktail.ingredients.join(', ')}</p>
                    <p>Likes: {cocktail.likes} | Dislikes: {cocktail.dislikes}</p>
                </li>
            {/each}
        </ul>
    {/if}
</main>

<style>
    .error {
        color: red;
    }
</style>