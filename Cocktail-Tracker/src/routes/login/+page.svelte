<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    
    export let form;
    
    // Récupérer l'url de redirection des paramètres
    $: redirectTo = $page.url.searchParams.get('redirect') || '/';
    $: registered = $page.url.searchParams.get('registered') === 'true';
    
    let email = form?.email || '';
    let password = '';
    let loading = false;
    
    // Gérer la soumission du formulaire avec une animation de chargement
    function handleSubmit() {
        loading = true;
        return ({ update }: { update: () => void }) => {
            loading = false;
            update();
        };
    }
</script>

<svelte:head>
    <title>Cocktail Tracker - Connexion</title>
</svelte:head>

<div class="auth-container">
    <div class="auth-card">
        <h1>Connexion</h1>
        
        {#if registered}
            <div class="message success">
                <p>Compte créé avec succès ! Vous pouvez maintenant vous connecter.</p>
            </div>
        {/if}
        
        {#if form?.error}
            <div class="message error">
                <p>{form.error}</p>
            </div>
        {/if}
        
        <form method="POST" use:enhance={handleSubmit}>
            <!-- Champ caché pour la redirection -->
            <input type="hidden" name="redirect" value={redirectTo} />
            
            <div class="form-group">
                <label for="email">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    bind:value={email}
                    placeholder="votre@email.com" 
                    required
                    autocomplete="email"
                />
            </div>
            
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    bind:value={password} 
                    placeholder="••••••••" 
                    required
                    autocomplete="current-password"
                />
            </div>
            
            <button type="submit" class="submit-btn" disabled={loading}>
                {#if loading}
                    Connexion en cours...
                {:else}
                    Se connecter
                {/if}
            </button>
        </form>
        
        <div class="auth-footer">
            <p>Pas encore de compte ? <a href="/register">Créer un compte</a></p>
        </div>
    </div>
</div>

<style>
    .auth-container {
        max-width: 500px;
        margin: 50px auto;
        padding: 0 20px;
    }
    
    .auth-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 30px;
    }
    
    h1 {
        text-align: center;
        margin-bottom: 25px;
        color: #333;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #555;
    }
    
    input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    }
    
    input:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }
    
    .submit-btn {
        width: 100%;
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 14px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .submit-btn:hover:not(:disabled) {
        background-color: #3a7bc8;
    }
    
    .submit-btn:disabled {
        background-color: #a0c3e8;
        cursor: not-allowed;
    }
    
    .auth-footer {
        margin-top: 25px;
        text-align: center;
        font-size: 0.9rem;
    }
    
    .auth-footer a {
        color: #4a90e2;
        text-decoration: none;
    }
    
    .auth-footer a:hover {
        text-decoration: underline;
    }
    
    .message {
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 4px;
    }
    
    .error {
        background-color: #fff1f0;
        border-left: 4px solid #ff4d4f;
        color: #cf1322;
    }
</style>