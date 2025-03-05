<script lang="ts">
    import CocktailCard from '$lib/components/CocktailCard.svelte';
    import type { Cocktail } from '$lib/types/cocktail';
    
    export let data: {
        cocktails: Cocktail[];
        error: string | null;
    };
</script>

<div class="cocktails-container">
    <div class="cocktails-header">
        <h1>Nos cocktails</h1>
    </div>
    
    <div class="add-button-container">
        <a href="/create" class="create-btn">
            <span>+</span> Ajouter un cocktail
        </a>
    </div>
    
    {#if data.error}
        <div class="message error">
            <p>{data.error}</p>
        </div>
    {/if}
    
    {#if data.cocktails.length === 0}
        <div class="message info">
            <p>Aucun cocktail disponible. Pourquoi ne pas en créer un?</p>
        </div>
    {:else}
        <div class="cocktail-list">
            {#each data.cocktails as cocktail (cocktail.id)}
                <CocktailCard {cocktail} />
            {/each}
        </div>
    {/if}
</div>

<style>
    .cocktails-container {
        width: 100%;
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 20px;
    }
    
    .cocktails-header {
        margin-bottom: 0.75rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
    }
    
    .add-button-container {
        margin-bottom: 1.5rem;
    }
    
    .create-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background-color: #4a90e2;
        color: white;
        padding: 0.6rem 1.2rem;
        border-radius: 4px;
        font-weight: 500;
        text-decoration: none;
        transition: background-color 0.2s;
    }
    
    .create-btn:hover {
        background-color: #3a7bc8;
        text-decoration: none;
    }
    
    .cocktail-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
        width: 100%;
    }
</style>