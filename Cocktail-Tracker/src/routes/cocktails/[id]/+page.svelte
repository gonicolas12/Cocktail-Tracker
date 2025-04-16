<script lang="ts">
    import { enhance } from "$app/forms";
    import CocktailCard from "$lib/components/CocktailCard.svelte";
    import { page } from "$app/stores";

    export let data;

    // Récupérer les données du serveur
    $: cocktail = data.cocktail;
    $: comments = data.comments;
    $: userVote = data.userVote;
    $: isOwner = data.isOwner;

    let commentContent = "";
    let showDeleteConfirm = false;

    // Formatter la date
    function formatDate(dateString: string): string {
        if (!dateString) return "";

        const date = new Date(dateString);
        return new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    }

    // Réinitialiser le formulaire de commentaire après soumission
    function resetForm() {
        commentContent = "";
    }

    // Version corrigée de la fonction à utiliser avec enhance
    function handleEnhance() {
        return ({ update }: { update: () => void }) => {
            resetForm();
            update();
        };
    }

    // Fonctions pour le modal de suppression
    function openDeleteModal() {
        showDeleteConfirm = true;
    }

    function closeDeleteModal() {
        showDeleteConfirm = false;
    }

    // Ferme le modal si on clique en dehors
    function handleModalBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            closeDeleteModal();
        }
    }
</script>

<svelte:head>
    <title>Cocktail Tracker - {cocktail.title}</title>
</svelte:head>

<div class="detail-container">
    <div class="recipe-card-container">
        {#if isOwner}
            <button
                class="delete-icon"
                on:click={openDeleteModal}
                aria-label="Supprimer cette recette"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        {/if}

        <CocktailCard
            {cocktail}
            {userVote}
            user={$page.data.user}
            showDetails={true}
        />
    </div>

    <!-- Modal de confirmation de suppression -->
    {#if showDeleteConfirm}
        <div
            class="modal-backdrop"
            on:click={handleModalBackdropClick}
            on:keydown={(e) => e.key === "Escape" && closeDeleteModal()}
            role="dialog"
            aria-modal="true"
            tabindex="0"
        >
            <div class="modal-content">
                <h3>Confirmation de suppression</h3>
                <p>Êtes-vous sûr de vouloir supprimer cette recette ?</p>
                <div class="modal-actions">
                    <button class="cancel-btn" on:click={closeDeleteModal}>
                        Annuler
                    </button>
                    <form 
                    method="POST" 
                    action="?/deleteRecipe" 
                    use:enhance={({ formData, formElement, action, cancel, submitter }) => {
                        return async ({ result }) => {
                            if (result.type === 'success' && result.data?.redirect) {
                                // Redirection côté client après une suppression réussie
                                window.location.href = '/';
                            }
                        };
                    }}
                >
                    <button type="submit" class="confirm-btn">
                        Oui, supprimer
                    </button>
                </form>
                </div>
            </div>
        </div>
    {/if}

    <div class="comments-section">
        <h2>Commentaires ({comments.length})</h2>

        {#if $page.data.user}
            <form
                method="POST"
                action="?/addComment"
                use:enhance={handleEnhance}
            >
                <div class="form-group">
                    <textarea
                        name="content"
                        bind:value={commentContent}
                        placeholder="Ajouter un commentaire..."
                        rows="3"
                        required
                    ></textarea>
                </div>
                <button type="submit" class="comment-btn"> Commenter </button>
            </form>
        {:else}
            <div class="login-prompt">
                <p>
                    <a href={`/login?redirect=/cocktails/${cocktail.id}`}
                        >Connectez-vous</a
                    >
                    pour ajouter un commentaire
                </p>
            </div>
        {/if}

        {#if comments.length === 0}
            <div class="no-comments">
                <p>
                    Aucun commentaire pour l'instant. Soyez le premier à
                    commenter !
                </p>
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
                                        if (Array.isArray(comment.users)) {
                                            // Utilisez une assertion de type explicite
                                            const firstUser = comment.users[0] as any;
                                            return firstUser?.username || 'Utilisateur';
                                        } else {
                                            // Utilisez une assertion de type explicite
                                            const users = comment.users as any;
                                            return users.username || 'Utilisateur';
                                        }
                                    })()}
                                {:else}
                                    Utilisateur
                                {/if}
                            </span>
                            <span class="date"
                                >{formatDate(comment.created_at)}</span
                            >
                        </div>
                        <p class="comment-content">{comment.content}</p>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    /* Styles existants inchangés */
    .detail-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 30px 20px;
        position: relative;
    }

    /* Conteneur pour positionner l'icône de suppression */
    .recipe-card-container {
        position: relative;
    }

    /* Style de l'icône de suppression */
    .delete-icon {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        color: #ff4d4f;
        cursor: pointer;
        z-index: 10;
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .delete-icon:hover {
        background-color: rgba(255, 77, 79, 0.1);
        transform: scale(1.1);
    }

    /* Modal de confirmation */
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        padding: 25px;
        width: 100%;
        max-width: 400px;
        animation: modalFadeIn 0.3s;
    }

    @keyframes modalFadeIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .modal-content h3 {
        margin-top: 0;
        color: #333;
        font-size: 1.4rem;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }

    .cancel-btn {
        background-color: #f0f0f0;
        color: #555;
        border: none;
        border-radius: 4px;
        padding: 10px 16px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .cancel-btn:hover {
        background-color: #e0e0e0;
    }

    .confirm-btn {
        background-color: #ff4d4f;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 10px 16px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .confirm-btn:hover {
        background-color: #ff7875;
    }

    /* Style du formulaire dans le modal */
    .modal-actions form {
        margin: 0;
        padding: 0;
        background: none;
    }

    /* Style amélioré pour la section des commentaires */
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

    /* Amélioration du style des commentaires individuels */
    .comment {
        padding: 15px;
        border: 1px solid #eee;
        border-radius: 8px;
        margin-bottom: 20px;
        background-color: #f9f9f9;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
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
