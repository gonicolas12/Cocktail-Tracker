<script lang="ts">
    import { enhance } from '$app/forms';
    import CocktailCard from '$lib/components/CocktailCard.svelte';
    import { page } from '$app/stores';
    
    export let data;
    
    // Récupérer les données du serveur
    $: cocktail = data.cocktail;
    $: comments = data.comments;
    $: userVote = data.userVote;
    $: isOwner = data.isOwner;
    
    let commentContent = '';
    let showDeleteConfirm = false;
    
    // Formatter la date
    function formatDate(dateString: string): string {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    // Réinitialiser le formulaire de commentaire après soumission
    function resetForm() {
        commentContent = '';
    }

    // Version corrigée de la fonction à utiliser avec enhance
    function handleEnhance() {
        return ({ update }: { update: () => void }) => {
            resetForm();
            update();
        };
    }
</script>

<svelte:head>
    <title>Cocktail Tracker - {cocktail.title}</title>
</svelte:head>

<div class="detail-container">
    <CocktailCard 
        cocktail={cocktail} 
        userVote={userVote} 
        user={$page.data.user} 
        showDetails={true} 
    />
    
    {#if isOwner}
        <div class="owner-actions">
            {#if !showDeleteConfirm}
                <button class="delete-btn" on:click={() => showDeleteConfirm = true}>
                    Supprimer cette recette
                </button>
            {:else}
                <div class="delete-confirm">
                    <p>Êtes-vous sûr de vouloir supprimer cette recette ?</p>
                    <div class="confirm-actions">
                        <button class="cancel-btn" on:click={() => showDeleteConfirm = false}>
                            Annuler
                        </button>
                        <form method="POST" action="?/deleteRecipe" use:enhance>
                            <button type="submit" class="confirm-btn">
                                Oui, supprimer
                            </button>
                        </form>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
    
    <div class="comments-section">
        <h2>Commentaires ({comments.length})</h2>
        
        {#if $page.data.user}
            <!-- Utilisez enhance de manière plus simple -->
            <form method="POST" action="?/addComment" use:enhance={handleEnhance}>
                <div class="form-group">
                    <textarea 
                        name="content"
                        bind:value={commentContent}
                        placeholder="Ajouter un commentaire..."
                        rows="3"
                        required
                    ></textarea>
                </div>
                <button type="submit" class="comment-btn">
                    Commenter
                </button>
            </form>
        {:else}
            <div class="login-prompt">
                <p>
                    <a href={`/login?redirect=/cocktails/${cocktail.id}`}>Connectez-vous</a> 
                    pour ajouter un commentaire
                </p>
            </div>
        {/if}
        
        {#if comments.length === 0}
            <div class="no-comments">
                <p>Aucun commentaire pour l'instant. Soyez le premier à commenter !</p>
            </div>
        {:else}
        <div class="comments-list">
            {#each comments as comment}
            <div class="comment">
                <div class="comment-header">
                    <!-- Approche plus sûre pour accéder à username -->
                    <span class="username">
                        {#if comment.users && typeof comment.users === 'object'}
                            {(() => {
                                // Utiliser une fonction immédiatement invoquée pour gérer la logique complexe
                                if (Array.isArray(comment.users)) {
                                    return comment.users[0]?.username || 'Utilisateur';
                                } else {
                                    // @ts-ignore - ignorer l'erreur de TypeScript ici
                                    return comment.users.username || 'Utilisateur';
                                }
                            })()}
                        {:else}
                            Utilisateur
                        {/if}
                    </span>
                    <span class="date">{formatDate(comment.created_at)}</span>
                </div>
                <p class="comment-content">{comment.content}</p>
            </div>
            {/each}
        </div>
        {/if}
    </div>
</div>