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

<style>    
    .detail-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 30px 20px;
    }
    
    .comments-section {
        margin-top: 40px;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 25px;
    }
    
    /* Titre de la section commentaires */
    .comments-section h2 {
        margin-top: 0;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
        margin-bottom: 20px;
        color: #333;
    }
    
    .comment {
        padding: 15px;
        border: 1px solid #eee;
        border-radius: 8px;
        margin-bottom: 20px;
        background-color: #f9f9f9;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .comment:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }
    
    /* En-tête du commentaire avec nom et date */
    .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;
    }
    
    /* Nom d'utilisateur */
    .username {
        font-weight: bold;
        color: #4a90e2;
    }
    
    /* Date du commentaire */
    .date {
        font-size: 0.85rem;
        color: #999;
    }
    
    /* Contenu du commentaire */
    .comment-content {
        margin: 0;
        line-height: 1.6;
        color: #444;
    }
    
    /* Formulaire d'ajout de commentaire */
    form {
        margin-bottom: 30px;
        background-color: #f5f7fa;
        padding: 20px;
        border-radius: 8px;
    }
    
    textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        resize: vertical;
        background-color: white;
    }
    
    /* Message quand il n'y a pas de commentaires */
    .no-comments {
        text-align: center;
        padding: 30px 0;
        color: #777;
        font-style: italic;
        background-color: #f9f9f9;
        border-radius: 8px;
        margin-top: 20px;
    }
    
    /* Amélioration du bouton de commentaire */
    .comment-btn {
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        margin-top: 10px;
    }
    
    .comment-btn:hover {
        background-color: #3a7bc8;
    }
    
    /* Notification pour la connexion */
    .login-prompt {
        background-color: #f5f7fa;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 30px;
        border-left: 4px solid #4a90e2;
    }
</style>