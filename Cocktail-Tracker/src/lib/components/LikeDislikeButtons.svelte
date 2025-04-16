<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { goto } from '$app/navigation';
    
    export let cocktailId: number;
    export let likes: number = 0;
    export let dislikes: number = 0;
    export let userVote: 'like' | 'dislike' | null = null;
    export let isLoggedIn: boolean = false;
    
    const dispatch = createEventDispatcher();
    
    async function handleVote(voteType: 'like' | 'dislike') {
        if (!isLoggedIn) {
            goto('/login?redirect=/cocktails/' + cocktailId);
            return;
        }
        
        try {
            const response = await fetch(`/api/cocktails/${cocktailId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ voteType }),
            });
            
            const result = await response.json();
            
            if (result.success) {
                dispatch('voteUpdate', {
                    likes: result.likes,
                    dislikes: result.dislikes,
                    userVote: result.userVote
                });
            } else {
                console.error('Erreur de vote:', result.message);
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
        }
    }
</script>

<div class="vote-buttons">
    <button 
        class="vote-btn like-btn" 
        class:active={userVote === 'like'}
        on:click={() => handleVote('like')} 
        aria-label="J'aime"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 10v12"></path>
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
        </svg>
        <span class="count">{likes}</span>
    </button>
    
    <button 
        class="vote-btn dislike-btn" 
        class:active={userVote === 'dislike'}
        on:click={() => handleVote('dislike')} 
        aria-label="Je n'aime pas"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 14V2"></path>
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
        </svg>
        <span class="count">{dislikes}</span>
    </button>
</div>

<style>
    .vote-buttons {
        display: flex;
        gap: 10px;
    }
    
    .vote-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 6px 12px;
        border: 1px solid #ddd;
        border-radius: 20px;
        background-color: white;
        color: #555;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .vote-btn:hover {
        background-color: #f5f5f5;
    }
    
    .vote-btn.active {
        border-color: #4a90e2;
        background-color: #f0f7ff;
        color: #4a90e2;
    }
    
    .like-btn.active {
        border-color: #52c41a;
        background-color: #f6ffed;
        color: #52c41a;
    }
    
    .dislike-btn.active {
        border-color: #ff4d4f;
        background-color: #fff1f0;
        color: #ff4d4f;
    }
    
    .count {
        font-weight: bold;
    }
</style>