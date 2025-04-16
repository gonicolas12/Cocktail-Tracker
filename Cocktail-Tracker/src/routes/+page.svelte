<script lang="ts">
    import { page } from '$app/stores';
    import SearchBar from '$lib/components/SearchBar.svelte';
    import CocktailCard from '$lib/components/CocktailCard.svelte';
    import { goto } from '$app/navigation';
    
    export let data;
    
    // S'assurer que data.filters existe et a une valeur par défaut
    $: filters = data?.filters || { searchTerm: '', sortBy: 'created_at', direction: 'desc' };
    $: searchTerm = filters?.searchTerm || '';
    $: cocktails = data?.cocktails || [];
    $: userVotes = data?.userVotes || [];
    $: error = data?.error;
    
    // Options de tri
    const sortOptions = [
        { label: 'Les plus populaires', value: 'likes|desc' },
        { label: 'Les plus récents', value: 'created_at|desc' },
        { label: 'Les plus anciens', value: 'created_at|asc' },
        { label: 'Les moins populaires', value: 'likes|asc' }
    ];
    
    $: selectedSort = filters?.sortBy && filters?.direction 
        ? `${filters.sortBy}|${filters.direction}` 
        : 'likes|desc';
            
    // Fonction de recherche
    function handleSearch(event: CustomEvent<string>): void {
        const term = event.detail || '';
        updateUrlParams({ search: term });
    }
    
    // Fonction de tri
    function handleSort(event: Event): void {
        const select = event.target as HTMLSelectElement;
        const [sortBy, direction] = select.value.split('|');
        updateUrlParams({ sort: sortBy, dir: direction });
    }
    
    // Mettre à jour les paramètres d'URL et recharger la page
    function updateUrlParams(params: Record<string, string | null>): void {
        const url = new URL(window.location.href);
        
        // Mettre à jour les paramètres
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, value.toString());
            } else {
                url.searchParams.delete(key);
            }
        });
        
        // Si l'utilisateur est connecté, ajouter son ID pour récupérer ses votes
        if ($page.data.user) {
            url.searchParams.set('userId', $page.data.user.id.toString());
        }
        
        goto(url.toString());
    }
</script>

<svelte:head>
    <title>Cocktail Tracker - Accueil</title>
</svelte:head>

<div class="home-container">
    <h1>Découvrez des cocktails incroyables</h1>
    
    <div class="search-sort-container">
        <SearchBar 
            value={searchTerm} 
            on:search={handleSearch} 
            placeholder="Rechercher par nom ou ingrédient..."
        />
        
        <div class="sort-container">
            <label for="sort">Trier par:</label>
            <select id="sort" bind:value={selectedSort} on:change={handleSort}>
                {#each sortOptions as option}
                    <option value={option.value}>{option.label}</option>
                {/each}
            </select>
        </div>
    </div>
    
    {#if error}
        <div class="message error">
            <p>{error}</p>
        </div>
    {/if}
    
    {#if cocktails.length === 0}
        <div class="no-results">
            <p>Aucun cocktail trouvé{searchTerm ? ` pour "${searchTerm}"` : ''}.</p>
            {#if $page.data.user}
                <a href="/create" class="create-btn">Créer votre premier cocktail</a>
            {:else}
                <p>Connectez-vous pour ajouter des cocktails!</p>
            {/if}
        </div>
    {:else}
        <div class="cocktails-grid">
            {#each cocktails as cocktail}
                <CocktailCard 
                    {cocktail}
                    userVote={userVotes.find(v => v.cocktail_id === cocktail.id)?.vote_type || null}
                    user={$page.data.user}
                />
            {/each}
        </div>
    {/if}
    
    {#if $page.data.user}
        <a href="/create" class="floating-action-btn">+</a>
    {/if}
</div>

<style>
    .home-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        position: relative;
    }
    
    h1 {
        text-align: center;
        margin-bottom: 30px;
        color: #333;
    }
    
    .search-sort-container {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 30px;
    }
    
    @media (min-width: 768px) {
        .search-sort-container {
            flex-direction: row;
            align-items: center;
        }
    }
    
    .sort-container {
        display: flex;
        align-items: center;
        gap: 10px;
        white-space: nowrap;
    }
    
    select {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
    }
    
    .cocktails-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }
    
    .message {
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 4px;
    }
    
    .error {
        background-color: #fff1f0;
        border-left: 4px solid #ff4d4f;
        color: #cf1322;
    }
    
    .no-results {
        text-align: center;
        padding: 40px 0;
    }
    
    .create-btn {
        display: inline-block;
        background-color: #4a90e2;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        text-decoration: none;
        margin-top: 15px;
    }
    
    .floating-action-btn {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        background-color: #4a90e2;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        font-size: 30px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s, background-color 0.2s;
    }
    
    .floating-action-btn:hover {
        transform: scale(1.1);
        background-color: #3a7bc8;
    }
</style>