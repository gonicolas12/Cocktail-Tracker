<script lang="ts">
    import type { Cocktail } from '$lib/types/cocktail';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabase'; // Import du client Supabase
    
    export let cocktail: Cocktail;
    
    // État local pour les compteurs de likes/dislikes
    let localLikes = cocktail.likes || 0;
    let localDislikes = cocktail.dislikes || 0;
    let isLoading = false;
    let errorMessage = '';
    let userVote: 'like' | 'dislike' | null = null;
    
    // Vérifier si l'utilisateur a déjà voté pour ce cocktail
    onMount(async () => {
        if ($page.data.user) {
            try {
                const { data } = await supabase
                    .from('cocktail_votes')
                    .select('vote_type')
                    .eq('user_id', $page.data.user.id)
                    .eq('cocktail_id', cocktail.id)
                    .maybeSingle();
                
                if (data) {
                    userVote = data.vote_type as 'like' | 'dislike';
                }
            } catch (error) {
                console.error('Erreur lors de la vérification du vote de l\'utilisateur:', error);
            }
        }
    });
    
    // Fonction pour voter (like ou dislike)
    async function vote(type: 'like' | 'dislike') {
        // Vérifier si l'utilisateur est connecté
        if (!$page.data.user) {
            errorMessage = 'Vous devez être connecté pour voter';
            setTimeout(() => errorMessage = '', 3000);
            return;
        }
        
        try {
            isLoading = true;
            
            const response = await fetch(`/api/cocktails/${cocktail.id}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ voteType: type })
            });
            
            const result = await response.json();
            
            if (result.success) {
                localLikes = result.likes;
                localDislikes = result.dislikes;
                userVote = result.userVote;
            } else {
                errorMessage = result.message || 'Erreur lors du vote';
                setTimeout(() => errorMessage = '', 3000);
            }
        } catch (error) {
            console.error('Erreur lors du vote:', error);
            errorMessage = 'Erreur de connexion';
            setTimeout(() => errorMessage = '', 3000);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="card">
    <div class="header">
        <h2>{cocktail.title}</h2>
        <span class="username">par {cocktail.user_username || 'User'}</span>
    </div>
    
    <hr />
    
    <div class="ingredients">
        <h3>Ingrédients:</h3>
        <ul>
            {#each cocktail.ingredients as ingredient}
                <li>{ingredient}</li>
            {/each}
        </ul>
    </div>
    
    {#if errorMessage}
        <div class="error-message">
            {errorMessage}
        </div>
    {/if}
    
    <div class="actions">
        <button 
            class="like-btn" 
            class:active={userVote === 'like'} 
            on:click={() => vote('like')} 
            disabled={isLoading}
        >
            <span class="icon">👍</span> {localLikes}
        </button>
        <button 
            class="dislike-btn" 
            class:active={userVote === 'dislike'} 
            on:click={() => vote('dislike')} 
            disabled={isLoading}
        >
            <span class="icon">👎</span> {localDislikes}
        </button>
    </div>
</div>

<style>
    .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin-bottom: 20px;
        width: 450px;
    }
    
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .header h2 {
        margin: 0;
        font-size: 24px;
    }
    
    .username {
        font-size: 14px;
        color: #666;
        font-style: italic;
    }
    
    hr {
        border: 0;
        border-top: 1px solid #eee;
        margin: 10px 0;
    }
    
    .ingredients h3 {
        margin-top: 0;
        margin-bottom: 10px;
    }
    
    .ingredients ul {
        padding-left: 20px;
    }
    
    .ingredients li {
        margin-bottom: 5px;
    }
    
    .error-message {
        background-color: #fff1f0;
        border-left: 4px solid #ff4d4f;
        color: #cf1322;
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        font-size: 14px;
    }
    
    .actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }
    
    .like-btn, .dislike-btn {
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .like-btn {
        background-color: #4caf50;
        color: white;
        opacity: 0.7;
    }
    
    .dislike-btn {
        background-color: #f44336;
        color: white;
        opacity: 0.7;
    }
    
    .like-btn:hover, .dislike-btn:hover {
        opacity: 0.9;
    }
    
    .like-btn.active, .dislike-btn.active {
        opacity: 1;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    }
    
    .like-btn:disabled, .dislike-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .icon {
        font-size: 16px;
    }
</style>