<script lang="ts">
    import { supabase } from '$lib/supabase';
    
    export let id: number;
    export let likes: number;
    export let dislikes: number;
    
    async function handleLike() {
        const { error } = await supabase
            .from('cocktails')
            .update({ likes: likes + 1 })
            .eq('id', id);
            
        if (!error) {
            likes += 1;
        }
    }
    
    async function handleDislike() {
        const { error } = await supabase
            .from('cocktails')
            .update({ dislikes: dislikes + 1 })
            .eq('id', id);
            
        if (!error) {
            dislikes += 1;
        }
    }
</script>

<div class="vote-buttons">
    <button class="like-btn" on:click={handleLike}>
        👍 <span>{likes}</span>
    </button>
    <button class="dislike-btn" on:click={handleDislike}>
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
    
    .like-btn {
        background-color: #e6f7e6;
    }
    
    .like-btn:hover {
        background-color: #d1ecd1;
    }
    
    .dislike-btn {
        background-color: #f7e6e6;
    }
    
    .dislike-btn:hover {
        background-color: #ecd1d1;
    }
</style>