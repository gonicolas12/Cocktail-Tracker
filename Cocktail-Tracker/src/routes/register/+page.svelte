<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    
    export let form: {
        error?: string;
        username?: string;
        email?: string;
    } | undefined = undefined;
    
    let password = '';
    let confirmPassword = '';
    let passwordError = '';
    
    function validatePasswords() {
        if (password !== confirmPassword) {
            passwordError = 'Les mots de passe ne correspondent pas';
            return false;
        }
        passwordError = '';
        return true;
    }
</script>

<div class="register-container">
    <h1>Créer un compte</h1>
    
    {#if form?.error}
        <div class="message error">
            <p>{form.error}</p>
        </div>
    {/if}
    
    <form method="POST" use:enhance class="register-form">
        <div class="form-group">
            <label for="username">Pseudo</label>
            <input 
                type="text" 
                id="username" 
                name="username" 
                value={form?.username || ''} 
                placeholder="Votre pseudo"
                required
                minlength="3"
                maxlength="50"
            />
        </div>
        
        <div class="form-group">
            <label for="email">Email</label>
            <input 
                type="email" 
                id="email" 
                name="email" 
                value={form?.email || ''} 
                placeholder="vous@exemple.com"
                required
            />
        </div>
        
        <div class="form-group">
            <label for="password">Mot de passe</label>
            <input 
                type="password" 
                id="password" 
                name="password" 
                bind:value={password}
                placeholder="Mot de passe"
                required
                minlength="8"
            />
        </div>
        
        <div class="form-group">
            <label for="confirm-password">Confirmer le mot de passe</label>
            <input 
                type="password" 
                id="confirm-password" 
                bind:value={confirmPassword}
                placeholder="Confirmez le mot de passe"
                required
                on:input={validatePasswords}
            />
            {#if passwordError}
                <small class="error-text">{passwordError}</small>
            {/if}
        </div>
        
        <div class="form-actions">
            <button type="submit" class="submit-btn" disabled={!!passwordError}>
                Créer un compte
            </button>
        </div>
        
        <div class="login-link">
            <p>Vous avez déjà un compte ? <a href="/login">Connectez-vous</a></p>
        </div>
    </form>
</div>

<style>
    .register-container {
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .register-form {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 25px;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
        color: #555;
    }
    
    input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    }
    
    input:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }
    
    .error-text {
        color: #ff4d4f;
        font-size: 14px;
        margin-top: 5px;
        display: block;
    }
    
    .submit-btn {
        width: 100%;
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 12px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .submit-btn:disabled {
        background-color: #a0c4e8;
        cursor: not-allowed;
    }
    
    .submit-btn:hover:not(:disabled) {
        background-color: #3a7bc8;
    }
    
    .login-link {
        text-align: center;
        margin-top: 15px;
    }
    
    .login-link a {
        color: #4a90e2;
        text-decoration: none;
    }
    
    .login-link a:hover {
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