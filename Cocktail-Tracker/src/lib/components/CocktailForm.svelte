<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { CocktailFormData } from '$lib/types/cocktail';
    
    const dispatch = createEventDispatcher<{
        submit: CocktailFormData;
    }>();
    
    let title = '';
    let ingredients = '';
    let error = '';
    
    function handleSubmit() {
        error = '';
        
        if (!title.trim()) {
            error = 'Le titre est requis';
            return;
        }
        
        if (!ingredients.trim()) {
            error = 'Au moins un ingrédient est requis';
            return;
        }
        
        dispatch('submit', {
            title: title.trim(),
            ingredients: ingredients.trim()
        });
        
        // Réinitialiser le formulaire
        title = '';
        ingredients = '';
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="cocktail-form">
    <h2>Ajouter un nouveau cocktail</h2>
    
    {#if error}
        <div class="error-message">
            {error}
        </div>
    {/if}
    
    <div class="form-group">
        <label for="title">Nom du cocktail</label>
        <input 
            type="text" 
            id="title" 
            bind:value={title} 
            placeholder="ex: Mojito"
            required
        />
    </div>
    
    <div class="form-group">
        <label for="ingredients">Ingrédients (séparés par des virgules)</label>
        <textarea 
            id="ingredients" 
            bind:value={ingredients} 
            placeholder="ex: Rhum, Menthe, Citron vert, Sucre, Eau gazeuse"
            rows="4"
            required
        ></textarea>
        <small>Listez tous les ingrédients séparés par des virgules</small>
    </div>
    
    <button type="submit" class="submit-btn">Ajouter le cocktail</button>
</form>

<style>
    .cocktail-form {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 25px;
        max-width: 600px;
        margin: 0 auto;
    }
    
    h2 {
        margin-top: 0;
        color: #333;
        border-bottom: 2px solid #f0f0f0;
        padding-bottom: 15px;
        margin-bottom: 20px;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
        color: #555;
    }
    
    input, textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    }
    
    input:focus, textarea:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }
    
    small {
        display: block;
        margin-top: 5px;
        color: #777;
        font-size: 14px;
    }
    
    .submit-btn {
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 12px 20px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .submit-btn:hover {
        background-color: #3a7bc8;
    }
    
    .error-message {
        background-color: #ffeeee;
        color: #cc0000;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 20px;
        border-left: 4px solid #cc0000;
    }
</style>