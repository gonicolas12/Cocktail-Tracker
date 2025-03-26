<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    
    export let form: {
        error?: string;
        message?: string;
        success?: boolean;
        redirect?: string;
        title?: string;
        ingredients?: string;
    } | undefined = undefined;
</script>

<div class="create-container">
    <h1>Créer un nouveau cocktail</h1>
    
    {#if form?.error}
        <div class="message error">
            <p>{form.error}</p>
        </div>
    {/if}
    
    {#if form?.success}
        <div class="message success">
            <p>{form.message || "Cocktail Posté !"}</p>
            <script>
                // Redirection après un délai si un chemin de redirection est fourni
                if ({form.redirect}) {
                    setTimeout(() => {
                        window.location.href = {form.redirect};
                    }, 1500);
                }
            </script>
        </div>
    {/if}
    
    <form method="POST" use:enhance class="cocktail-form">
        <div class="form-group">
            <label for="title">Nom du cocktail</label>
            <input 
                type="text" 
                id="title" 
                name="title" 
                value={form?.title || ''} 
                placeholder="ex: Mojito"
                required
            />
        </div>
        
        <div class="form-group">
            <label for="ingredients">Ingrédients (séparés par des virgules)</label>
            <textarea 
                id="ingredients" 
                name="ingredients" 
                value={form?.ingredients || ''} 
                placeholder="ex: Rhum, Menthe, Citron vert, Sucre, Eau gazeuse"
                rows="4"
                required
            ></textarea>
            <small>Listez tous les ingrédients séparés par des virgules</small>
        </div>
        
        <div class="form-actions">
            <a href="/" class="cancel-btn">Annuler</a>
            <button type="submit" class="submit-btn">Créer le cocktail</button>
        </div>
    </form>
</div>

<style>
    .create-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .cocktail-form {
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
    
    input, textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    }
    
    input:focus, textarea:focus {
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
    
    .form-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    }
    
    .submit-btn {
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 12px 24px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .submit-btn:hover {
        background-color: #3a7bc8;
    }
    
    .cancel-btn {
        background-color: #f0f0f0;
        color: #555;
        padding: 12px 24px;
        border-radius: 4px;
        text-decoration: none;
        transition: background-color 0.2s;
    }
    
    .cancel-btn:hover {
        background-color: #e0e0e0;
        text-decoration: none;
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
    
    .success {
        background-color: #f6ffed;
        border-left: 4px solid #52c41a;
        color: #52c41a;
    }
</style>