<script lang="ts">
    import { enhance } from '$app/forms';
    
    export let form: {
        error?: string;
        email?: string;
    } | undefined = undefined;
</script>

<div class="login-container">
    <h1>Connexion</h1>
    
    {#if form?.error}
        <div class="message error">
            <p>{form.error}</p>
        </div>
    {/if}
    
    <form method="POST" use:enhance class="login-form">
        <div class="form-group">
            <label for="email">Email ou pseudo</label>
            <input 
                type="text" 
                id="email" 
                name="email" 
                value={form?.email || ''} 
                placeholder="Votre email ou pseudo"
                required
            />
        </div>
        
        <div class="form-group">
            <label for="password">Mot de passe</label>
            <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Mot de passe"
                required
            />
        </div>
        
        <div class="form-actions">
            <button type="submit" class="submit-btn">
                Se connecter
            </button>
        </div>
        
        <div class="register-link">
            <p>Pas de compte ? <a href="/register">Créez-en un</a></p>
        </div>
    </form>
</div>

<style>
    .login-container {
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .login-form {
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
    
    .submit-btn:hover {
        background-color: #3a7bc8;
    }
    
    .register-link {
        text-align: center;
        margin-top: 15px;
    }
    
    .register-link a {
        color: #4a90e2;
        text-decoration: none;
    }
    
    .register-link a:hover {
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