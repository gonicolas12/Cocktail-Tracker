<script lang="ts">
    type Cocktail = {
        id: number;
        title: string;
        ingredients: string[];
        likes: number;
        dislikes: number;
    };

    export let data: { cocktails: Cocktail[] };

    // Ajout de données factices
    data = {
        cocktails: [
            {
                id: 1,
                title: 'Mojito',
                ingredients: ['Rhum', 'Menthe', 'Citron vert', 'Sucre'],
                likes: 10,
                dislikes: 2
            }
        ]
    };
</script>

<main>
    <h1>Cocktail Tracker</h1>
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
