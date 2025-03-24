<script lang="ts">
    import "$lib/styles.css";
    import type { User } from '$lib/types/user';
    
    export let data: { user?: User | null };
</script>

<div class="layout">
    <header>
        <div class="container">
            <h1>Cocktail Tracker</h1>
            <nav>
                <a href="/">Accueil</a>
                <a href="/create">Créer un cocktail</a>
                
                {#if data.user}
                    <span class="user-greeting">
                        Bonjour, {data.user.username}
                    </span>
                    <form method="POST" action="/logout">
                        <button type="submit" class="logout-btn">
                            Déconnexion
                        </button>
                    </form>
                {:else}
                    <a href="/login">Connexion</a>
                    <a href="/register">Inscription</a>
                {/if}
            </nav>
        </div>
    </header>
    
    <main class="container">
        <slot />
    </main>
    
    <footer>
        <div class="container">
            <p>© {new Date().getFullYear()} Cocktail Tracker</p>
        </div>
    </footer>
</div>

<style>
    .layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    
    header {
        background-color: #3a3a3a;
        color: white;
        padding: 1rem 0;
    }
    
    header .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    nav {
        display: flex;
        align-items: center;
        gap: 20px;
    }
    
    nav a, .logout-btn {
        color: white;
        text-decoration: none;
        padding: 5px 10px;
        border-radius: 4px;
        transition: background-color 0.2s;
        background: none;
        border: none;
        cursor: pointer;
    }
    
    nav a:hover, .logout-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
    
    .user-greeting {
        margin-right: 15px;
        font-weight: bold;
    }
    
    .logout-btn {
        font-size: inherit;
    }
    
    main {
        flex: 1;
        padding: 2rem 0;
    }
    
    footer {
        background-color: #f5f5f5;
        padding: 1rem 0;
        border-top: 1px solid #ddd;
    }
    
    .container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 20px;
    }
    
    h1 {
        margin: 0;
    }
</style>