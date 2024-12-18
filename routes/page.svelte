<script>
    import { onMount } from 'svelte';
    let cocktails = [];

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
