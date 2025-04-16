<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { goto } from '$app/navigation';
    
    export let value = '';
    export let placeholder = 'Rechercher un cocktail...';
    export let searchOnType = false;
    
    const dispatch = createEventDispatcher();
    
    function handleInput(e: Event) {
        const input = e.target as HTMLInputElement;
        value = input.value;
        
        if (searchOnType) {
            dispatch('search', value);
        }
    }
    
    function handleSubmit(e: Event) {
        e.preventDefault();
        dispatch('search', value);
        
        // Si on est pas sur la page d'accueil, rediriger vers l'accueil avec le terme de recherche
        const path = window.location.pathname;
        if (path !== '/') {
            goto(`/?search=${encodeURIComponent(value)}`);
        }
    }
</script>

<form class="search-container" on:submit={handleSubmit}>
    <input 
        type="text" 
        bind:value 
        on:input={handleInput}
        {placeholder}
        class="search-input"
    />
    <button type="submit" class="search-button" aria-label="Rechercher">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    </button>
</form>

<style>
    .search-container {
        display: flex;
        width: 100%;
        max-width: 500px;
        margin: 0 auto 20px;
    }
    
    .search-input {
        flex: 1;
        padding: 10px 15px;
        border: 1px solid #ddd;
        border-radius: 4px 0 0 4px;
        font-size: 16px;
    }
    
    .search-input:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }
    
    .search-button {
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 0 4px 4px 0;
        padding: 0 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .search-button:hover {
        background-color: #3a7bc8;
    }
</style>