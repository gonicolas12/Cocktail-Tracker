<script lang="ts">
    import LikeDislikeButtons from './LikeDislikeButtons.svelte';
    import { goto } from '$app/navigation';
    import type { Cocktail } from '$lib/types/cocktail';
    import type { User } from '$lib/types/user';
    
    export let cocktail: Cocktail;
    export let userVote: 'like' | 'dislike' | null = null;
    export let user: User | null = null;
    export let showDetails = false;
    
    // Formatter la date
    function formatDate(dateString: string | undefined): string {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }).format(date);
    }
    
    // Naviguer vers la page détaillée du cocktail
    function goToDetail(): void {
        goto(`/cocktails/${cocktail.id}`);
    }
    
    // Gérer les keydown events pour l'accessibilité
    function handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' || event.key === ' ') {
            goToDetail();
        }
    }
    
    // Gérer les mises à jour de likes/dislikes
    function handleVoteUpdate(event: CustomEvent<{likes: number, dislikes: number, userVote: 'like' | 'dislike' | null}>): void {
        cocktail.likes = event.detail.likes;
        cocktail.dislikes = event.detail.dislikes;
        userVote = event.detail.userVote;
    }
</script>

<div class="cocktail-card" class:expanded={showDetails}>
    <div class="card-header" 
         on:click={goToDetail} 
         on:keydown={handleKeyDown}
         role="button" 
         tabindex="0">
        <h2>{cocktail.title}</h2>
        {#if cocktail.created_at}
            <p class="date">Posté le {formatDate(cocktail.created_at)}</p>
        {/if}
    </div>
    
    <div class="card-body">
        <h3>Ingrédients:</h3>
        <ul class="ingredients-list">
            {#each cocktail.ingredients as ingredient}
                <li>{ingredient}</li>
            {/each}
        </ul>
    </div>
    
    <div class="card-footer">
        <div class="card-meta">
            {#if cocktail.user_username}
                <p class="author">Par {cocktail.user_username}</p>
            {/if}
        </div>
        
        <LikeDislikeButtons 
            cocktailId={cocktail.id} 
            likes={cocktail.likes} 
            dislikes={cocktail.dislikes}
            userVote={userVote}
            isLoggedIn={!!user}
            on:voteUpdate={handleVoteUpdate}
        />
    </div>
    
    {#if showDetails}
        <a href="/" class="back-link">Retour à l'accueil</a>
    {/if}
</div>

<style>
    .cocktail-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .cocktail-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    .card-header {
        cursor: pointer;
    }
    
    .card-header h2 {
        margin: 0 0 10px;
        color: #333;
    }
    
    .date {
        font-size: 0.8rem;
        color: #777;
        margin: 0 0 15px;
    }
    
    .ingredients-list {
        padding-left: 20px;
        margin-bottom: 15px;
    }
    
    .ingredients-list li {
        margin-bottom: 5px;
    }
    
    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #eee;
    }
    
    .author {
        font-style: italic;
        color: #666;
        margin: 0;
    }
    
    .expanded {
        max-width: 800px;
        margin: 0 auto;
        padding: 30px;
    }
    
    .back-link {
        display: inline-block;
        margin-top: 20px;
        color: #4a90e2;
        text-decoration: none;
    }
    
    .back-link:hover {
        text-decoration: underline;
    }
</style>