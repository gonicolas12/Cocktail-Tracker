<script lang="ts">
    import { page } from '$app/stores';
</script>

<svelte:head>
    <title>Erreur - Cocktail Tracker</title>
</svelte:head>

<div class="error-container">
    <div class="error-content">
        <div class="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        </div>
        
        <h1>{$page.status} - {$page.error?.message || 'Une erreur est survenue'}</h1>
        
        <p class="error-description">
            {#if $page.status === 404}
                La page que vous recherchez n'existe pas ou a été déplacée.
            {:else if $page.status === 403}
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            {:else if $page.status === 500}
                Une erreur s'est produite sur notre serveur. Nos équipes ont été notifiées.
            {:else}
                Une erreur inattendue s'est produite. Veuillez réessayer ultérieurement.
            {/if}
        </p>
        
        <div class="action-buttons">
            <button class="back-btn" on:click={() => history.back()}>
                Retour
            </button>
            <a href="/" class="home-btn">
                Retour à l'accueil
            </a>
        </div>
    </div>
</div>

<style>
    .error-container {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    
    .error-content {
        max-width: 600px;
        text-align: center;
        background-color: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .error-icon {
        color: #ff4d4f;
        margin-bottom: 20px;
    }
    
    h1 {
        margin-bottom: 20px;
        color: #333;
    }
    
    .error-description {
        margin-bottom: 30px;
        color: #666;
        font-size: 1.1rem;
    }
    
    .action-buttons {
        display: flex;
        justify-content: center;
        gap: 15px;
    }
    
    .back-btn {
        background-color: #f0f0f0;
        color: #555;
        border: none;
        border-radius: 4px;
        padding: 12px 24px;
        cursor: pointer;
        font-size: 1rem;
    }
    
    .home-btn {
        background-color: #4a90e2;
        color: white;
        border-radius: 4px;
        padding: 12px 24px;
        text-decoration: none;
        font-size: 1rem;
    }
    
    @media (max-width: 768px) {
        .error-content {
            padding: 30px 20px;
        }
        
        .action-buttons {
            flex-direction: column;
            gap: 10px;
        }
        
        .back-btn, .home-btn {
            width: 100%;
            text-align: center;
        }
    }
</style>