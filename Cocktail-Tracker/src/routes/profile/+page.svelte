<script lang="ts">
    import { enhance } from '$app/forms';
    import CocktailCard from '$lib/components/CocktailCard.svelte';
    import type { Cocktail } from '$lib/types/cocktail';
    
    export let data;
    export let form;
    
    // Récupérer les données du serveur
    $: user = data.user;
    
    // Transformation des données avec traitement pour assurer le bon format
    $: userCocktails = Array.isArray(data.userCocktails) 
        ? data.userCocktails.map((cocktail: any) => ({
            id: cocktail.id,
            title: cocktail.title,
            ingredients: cocktail.ingredients || [],
            likes: cocktail.likes || 0,
            dislikes: cocktail.dislikes || 0,
            created_at: cocktail.created_at,
            created_by: cocktail.created_by,
            user_username: cocktail.user_username
          })) as Cocktail[]
        : [];
    
    $: likedCocktails = Array.isArray(data.likedCocktails) 
        ? data.likedCocktails.map((item: any) => {
            // Si l'item est déjà un objet avec les bonnes propriétés
            if (item && typeof item === 'object' && 'id' in item) {
                return {
                    id: item.id,
                    title: item.title,
                    ingredients: item.ingredients || [],
                    likes: item.likes || 0,
                    dislikes: item.dislikes || 0,
                    created_at: item.created_at,
                    created_by: item.created_by,
                    user_username: item.user_username
                } as Cocktail;
            }
            // Sinon, retourner un objet vide qui sera filtré
            return null;
          }).filter(Boolean) as Cocktail[]
        : [];
    
    $: dislikedCocktails = Array.isArray(data.dislikedCocktails) 
        ? data.dislikedCocktails.map((item: any) => {
            if (item && typeof item === 'object' && 'id' in item) {
                return {
                    id: item.id,
                    title: item.title,
                    ingredients: item.ingredients || [],
                    likes: item.likes || 0,
                    dislikes: item.dislikes || 0,
                    created_at: item.created_at,
                    created_by: item.created_by,
                    user_username: item.user_username
                } as Cocktail;
            }
            return null;
          }).filter(Boolean) as Cocktail[]
        : [];
    
    // Variables pour l'édition du profil
    let editMode = false;
    let changePasswordMode = false;
    let username = user?.username || '';
    let loading = false;
    
    // Variables pour le changement de mot de passe
    let currentPassword = '';
    let newPassword = '';
    let confirmPassword = '';
    let passwordError = '';
    
    // Affichage par onglets
    let activeTab = 'myRecipes'; // 'myRecipes', 'liked', 'disliked', 'settings'
    
    // Formater la date d'inscription
    function formatDate(dateString: string | undefined): string {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }).format(date);
    }
    
    // Gérer la soumission du formulaire de profil
    function handleProfileSubmit() {
        if (username.trim() === '') return;
        
        loading = true;
        return ({ update }: { update: () => void }) => {
            loading = false;
            if (form?.success) {
                editMode = false;
                username = form?.username || user.username;
            }
            update();
        };
    }
    
    // Gérer la soumission du formulaire de mot de passe
    function handlePasswordSubmit() {
        // Réinitialiser les erreurs
        passwordError = '';
        
        // Vérifier que le nouveau mot de passe correspond à la confirmation
        if (newPassword !== confirmPassword) {
            passwordError = 'Les mots de passe ne correspondent pas';
            return;
        }
        
        // Vérifier que le nouveau mot de passe a la longueur minimale
        if (newPassword.length < 6) {
            passwordError = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
            return;
        }
        
        loading = true;
        return ({ update }: { update: () => void }) => {
            loading = false;
            if (form?.passwordSuccess) {
                changePasswordMode = false;
                currentPassword = '';
                newPassword = '';
                confirmPassword = '';
            }
            update();
        };
    }
</script>

<svelte:head>
    <title>Cocktail Tracker - Mon profil</title>
</svelte:head>

<div class="profile-container">
    <div class="profile-header">
        <div class="user-info">
            <div class="avatar">
                {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            
            {#if editMode}
                <form method="POST" action="?/updateProfile" use:enhance={handleProfileSubmit} class="edit-form">
                    <div class="form-group">
                        <label for="username">Nom d'utilisateur</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            bind:value={username}
                            required
                        />
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="cancel-btn" on:click={() => {
                            editMode = false;
                            username = user.username;
                        }}>
                            Annuler
                        </button>
                        <button type="submit" class="save-btn" disabled={loading}>
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            {:else}
                <div class="user-details">
                    <h1>{user?.username}</h1>
                    <p class="user-email">{user?.email}</p>
                    {#if user?.created_at}
                        <p class="join-date">
                            Membre depuis le {formatDate(user.created_at)}
                        </p>
                    {/if}
                    <div class="profile-actions">
                        <button class="edit-btn" on:click={() => editMode = true}>
                            Modifier le nom
                        </button>
                        <button class="password-btn" on:click={() => {
                            activeTab = 'settings';
                            changePasswordMode = true;
                        }}>
                            Changer le mot de passe
                        </button>
                    </div>
                </div>
            {/if}
        </div>
        
        {#if form}
            {#if form.error}
                <div class="message error">
                    <p>{form.error}</p>
                </div>
            {:else if form.success}
                <div class="message success">
                    <p>{form.message}</p>
                </div>
            {/if}
        {/if}
    </div>
    
    <div class="profile-tabs">
        <button 
            class="tab-btn" 
            class:active={activeTab === 'myRecipes'} 
            on:click={() => activeTab = 'myRecipes'}
        >
            Mes recettes ({userCocktails.length})
        </button>
        <button 
            class="tab-btn" 
            class:active={activeTab === 'liked'} 
            on:click={() => activeTab = 'liked'}
        >
            Mes likes ({likedCocktails.length})
        </button>
        <button 
            class="tab-btn" 
            class:active={activeTab === 'disliked'} 
            on:click={() => activeTab = 'disliked'}
        >
            Mes dislikes ({dislikedCocktails.length})
        </button>
        <button 
            class="tab-btn" 
            class:active={activeTab === 'settings'} 
            on:click={() => activeTab = 'settings'}
        >
            Paramètres
        </button>
    </div>
    
    <div class="tab-content">
        {#if activeTab === 'myRecipes'}
            {#if userCocktails.length === 0}
                <div class="empty-state">
                    <p>Vous n'avez pas encore partagé de recettes de cocktail.</p>
                    <a href="/create" class="create-btn">Créer votre premier cocktail</a>
                </div>
            {:else}
                <div class="cocktails-grid">
                    {#each userCocktails as cocktail (cocktail.id)}
                        <CocktailCard {cocktail} user={user} />
                    {/each}
                </div>
            {/if}
        {:else if activeTab === 'liked'}
            {#if likedCocktails.length === 0}
                <div class="empty-state">
                    <p>Vous n'avez pas encore liké de cocktails.</p>
                    <a href="/" class="browse-btn">Parcourir les cocktails</a>
                </div>
            {:else}
                <div class="cocktails-grid">
                    {#each likedCocktails as cocktail (cocktail.id)}
                        <CocktailCard {cocktail} userVote="like" user={user} />
                    {/each}
                </div>
            {/if}
        {:else if activeTab === 'disliked'}
            {#if dislikedCocktails.length === 0}
                <div class="empty-state">
                    <p>Vous n'avez pas encore disliké de cocktails.</p>
                    <a href="/" class="browse-btn">Parcourir les cocktails</a>
                </div>
            {:else}
                <div class="cocktails-grid">
                    {#each dislikedCocktails as cocktail (cocktail.id)}
                        <CocktailCard {cocktail} userVote="dislike" user={user} />
                    {/each}
                </div>
            {/if}
        {:else if activeTab === 'settings'}
            <div class="settings-panel">
                <h2>Paramètres du compte</h2>
                
                <div class="settings-section">
                    <h3>Sécurité</h3>
                    
                    {#if changePasswordMode}
                        <form method="POST" action="?/changePassword" use:enhance={handlePasswordSubmit} class="password-form">
                            <div class="form-group">
                                <label for="currentPassword">Mot de passe actuel</label>
                                <input 
                                    type="password" 
                                    id="currentPassword" 
                                    name="currentPassword" 
                                    bind:value={currentPassword}
                                    required
                                />
                            </div>
                            
                            <div class="form-group">
                                <label for="newPassword">Nouveau mot de passe</label>
                                <input 
                                    type="password" 
                                    id="newPassword" 
                                    name="newPassword" 
                                    bind:value={newPassword}
                                    minlength="6"
                                    required
                                />
                                <small>Le mot de passe doit comporter au moins 6 caractères</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="confirmPassword">Confirmer le nouveau mot de passe</label>
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    name="confirmPassword" 
                                    bind:value={confirmPassword}
                                    required
                                />
                            </div>
                            
                            {#if passwordError}
                                <div class="message error">
                                    <p>{passwordError}</p>
                                </div>
                            {/if}
                            
                            <div class="form-actions">
                                <button type="button" class="cancel-btn" on:click={() => {
                                    changePasswordMode = false;
                                    currentPassword = '';
                                    newPassword = '';
                                    confirmPassword = '';
                                    passwordError = '';
                                }}>
                                    Annuler
                                </button>
                                <button type="submit" class="save-btn" disabled={loading}>
                                    {loading ? 'Modification...' : 'Changer le mot de passe'}
                                </button>
                            </div>
                        </form>
                    {:else}
                        <button class="password-btn" on:click={() => changePasswordMode = true}>
                            Changer le mot de passe
                        </button>
                    {/if}
                </div>
                
                <div class="settings-section">
                    <h3>Statistiques</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <span class="stat-value">{userCocktails.length}</span>
                            <span class="stat-label">Recettes créées</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value">{likedCocktails.length}</span>
                            <span class="stat-label">Recettes likées</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value">{dislikedCocktails.length}</span>
                            <span class="stat-label">Recettes dislikées</span>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .profile-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 30px 20px;
    }
    
    .profile-header {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 30px;
        margin-bottom: 30px;
    }
    
    .user-info {
        display: flex;
        align-items: center;
        gap: 20px;
    }
    
    .avatar {
        width: 80px;
        height: 80px;
        background-color: #4a90e2;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: bold;
    }
    
    .user-details {
        flex: 1;
    }
    
    .user-details h1 {
        margin: 0 0 5px;
        color: #333;
    }
    
    .user-email {
        color: #666;
        margin: 0 0 5px;
    }
    
    .join-date {
        color: #999;
        font-size: 0.9rem;
        margin-bottom: 15px;
    }
    
    .profile-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .edit-btn, .password-btn {
        background-color: #f0f0f0;
        color: #555;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        font-size: 14px;
    }
    
    .edit-btn:hover, .password-btn:hover {
        background-color: #e0e0e0;
    }
    
    .password-btn {
        background-color: #e6f7ff;
        color: #1890ff;
    }
    
    .password-btn:hover {
        background-color: #bae7ff;
    }
    
    .edit-form {
        flex: 1;
    }
    
    .form-group {
        margin-bottom: 15px;
    }
    
    .form-actions {
        display: flex;
        gap: 10px;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #555;
    }
    
    input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    }
    
    input:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }
    
    small {
        display: block;
        margin-top: 5px;
        color: #777;
        font-size: 14px;
    }
    
    .cancel-btn {
        background-color: #f0f0f0;
        color: #555;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
    }
    
    .save-btn {
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
    }
    
    .profile-tabs {
        display: flex;
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;
        overflow-x: auto;
    }
    
    .tab-btn {
        background: none;
        border: none;
        padding: 12px 20px;
        cursor: pointer;
        font-size: 1rem;
        color: #666;
        position: relative;
        white-space: nowrap;
    }
    
    .tab-btn.active {
        color: #4a90e2;
        font-weight: 500;
    }
    
    .tab-btn.active::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: #4a90e2;
    }
    
    .cocktails-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }
    
    .empty-state {
        text-align: center;
        padding: 50px 0;
    }
    
    .create-btn, .browse-btn {
        display: inline-block;
        background-color: #4a90e2;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        text-decoration: none;
        margin-top: 15px;
    }
    
    .message {
        padding: 15px;
        margin-top: 20px;
        border-radius: 4px;
    }
    
    .error {
        background-color: #fff1f0;
        border-left: 4px solid #ff4d4f;
        color: #cf1322;
    }
    
    .success {
        background-color: #f6ffed;
        border-left: 4px solid #52c41a;
        color: #389e0d;
    }
    
    /* Styles pour les paramètres */
    .settings-panel {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 25px;
    }
    
    .settings-panel h2 {
        margin-top: 0;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
        color: #333;
    }
    
    .settings-section {
        margin-bottom: 30px;
    }
    
    .settings-section h3 {
        font-size: 1.2rem;
        margin-bottom: 15px;
        color: #555;
    }
    
    .password-form {
        max-width: 500px;
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
    }
    
    /* Statistiques */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
    }
    
    .stat-card {
        background-color: #f9f9f9;
        border-radius: in;
        padding: 15px;
        text-align: center;
        border-radius: 8px;
        transition: transform 0.2s;
    }
    
    .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }
    
    .stat-value {
        display: block;
        font-size: 2rem;
        font-weight: bold;
        color: #4a90e2;
    }
    
    .stat-label {
        display: block;
        color: #666;
        margin-top: 5px;
    }
    
    @media (max-width: 768px) {
        .user-info {
            flex-direction: column;
            text-align: center;
        }
        
        .profile-tabs {
            overflow-x: auto;
            white-space: nowrap;
        }
        
        .profile-actions {
            justify-content: center;
        }
    }
</style>