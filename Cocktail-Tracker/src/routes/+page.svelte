<script lang="ts">
    import CocktailCard from '$lib/components/CocktailCard.svelte';
    import type { Cocktail } from '$lib/types/cocktail';
    
    export let data: {
        cocktails: Cocktail[];
        error: string | null;
    };
</script>

<div class="container">
    <div class="centered-content">
        <h1 class="page-title">Nos cocktails</h1>
        
        <div class="button-container">
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
</div>

<style>
    .container {
        width: 100%;
        margin: 0 auto;
        padding: 0 20px;
    }
    
    .centered-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        margin-top: 1.5rem;
    }
    
    .page-title {
        text-align: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
    }
    
    .button-container {
        margin-bottom: 1.5rem;
        text-align: center;
    }
    
    .cocktail-list {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }
    
    .message {
        width: 500px;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 4px;
    }
    
    .error {
        background-color: #fff1f0;
        border-left: 4px solid #ff4d4f;
    }
    
    .info {
        background-color: #e6f7ff;
        border-left: 4px solid #1890ff;
    }
</style>