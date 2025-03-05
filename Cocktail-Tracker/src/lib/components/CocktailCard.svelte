<script lang="ts">
    import type { Cocktail } from '$lib/types/cocktail';
    import LikeDislikeButtons from './LikeDislikeButtons.svelte';
    
    export let cocktail: Cocktail;
</script>

<div class="cocktail-card">
    <h2>{cocktail.title}</h2>
    
    <div class="ingredients">
        <h3>Ingrédients:</h3>
        <ul>
            {#each cocktail.ingredients as ingredient}
                <li>{ingredient}</li>
            {/each}
        </ul>
    </div>
    
    <div class="actions">
        <LikeDislikeButtons 
            id={cocktail.id} 
            likes={cocktail.likes} 
            dislikes={cocktail.dislikes} 
        />
    </div>
</div>

<style>
    .cocktail-card {
        background-color: white;
        width: 500px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin-bottom: 20px;
    }
    
    h2 {
        color: #333;
        margin-top: 0;
        border-bottom: 2px solid #f0f0f0;
        padding-bottom: 10px;
    }
    
    .ingredients ul {
        padding-left: 20px;
    }
    
    .ingredients li {
        margin-bottom: 5px;
    }
    
    .actions {
        display: flex;
        gap: 15px;
        margin-top: 20px;
    }
</style>