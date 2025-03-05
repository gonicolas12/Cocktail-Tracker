<script lang="ts">
    import { supabase } from '$lib/supabase';
    import { onMount } from 'svelte';
    
    export let id: number;
    export let likes: number;
    export let dislikes: number;
    
    let hasVoted = false;
    
    // Vérifier si l'utilisateur a déjà voté pour ce cocktail
    onMount(() => {
        const storedVotes = localStorage.getItem('cocktailVotes') || '{}';
        const votes = JSON.parse(storedVotes);
        
        if (votes[id]) {
            hasVoted = true;
        }
    });
    
    // Sauvegarder le vote dans localStorage
    function saveVote() {
        const storedVotes = localStorage.getItem('cocktailVotes') || '{}';
        const votes = JSON.parse(storedVotes);
        
        votes[id] = true;
        localStorage.setItem('cocktailVotes', JSON.stringify(votes));
        
        hasVoted = true;
    }
    
    async function handleLike() {
        if (hasVoted) return;
        
        const { error } = await supabase
            .from('cocktails')
            .update({ likes: likes + 1 })
            .eq('id', id);
            
        if (!error) {
            likes += 1;
            saveVote();
        }
    }
    
    async function handleDislike() {
        if (hasVoted) return;
        
        const { error } = await supabase
            .from('cocktails')
            .update({ dislikes: dislikes + 1 })
            .eq('id', id);
            
        if (!error) {
            dislikes += 1;
            saveVote();
        }
    }
</script>

<div class="vote-buttons">
    <button 
        class="like-btn" 
        on:click={handleLike}
        disabled={hasVoted}
        title={hasVoted ? "Vous avez déjà voté" : "J'aime"}
    >
        👍 <span>{likes}</span>
    </button>
    <button 
        class="dislike-btn" 
        on:click={handleDislike}
        disabled={hasVoted}
        title={hasVoted ? "Vous avez déjà voté" : "Je n'aime pas"}
    >
        👎 <span>{dislikes}</span>
    </button>
</div>

<style>
    .vote-buttons {
        display: flex;
        gap: 15px;
    }
    
    button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s;
    }
    
    /* Style pour indiquer l'état désactivé sans changer la couleur */
    button:disabled {
        cursor: not-allowed;
    }
    
    .like-btn {
        background-color: #58a35a;
        color: white;
    }
    
    .like-btn:hover:not(:disabled) {
        background-color: #58a35a
    }
    
    .dislike-btn {
        background-color: #d64d43;
        color: white;
    }
    
    .dislike-btn:hover:not(:disabled) {
        background-color: #d64d43
    }
</style>