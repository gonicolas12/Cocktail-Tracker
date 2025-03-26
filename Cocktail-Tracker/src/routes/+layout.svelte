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
                <a href="/" aria-label="Accueil">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="16" height="16" fill="currentColor"><path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg>
                </a>
                <a href="/create" aria-label="Créer un cocktail">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="16" height="16" fill="currentColor"><path d="M432 240c53 0 96-43 96-96s-43-96-96-96c-35.5 0-66.6 19.3-83.2 48l-52.6 0C316 40.1 369.3 0 432 0c79.5 0 144 64.5 144 144s-64.5 144-144 144c-27.7 0-53.5-7.8-75.5-21.3l35.4-35.4c12.2 5.6 25.8 8.7 40.1 8.7zM1.8 142.8C5.5 133.8 14.3 128 24 128l368 0c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2l-177 177L232 464l64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-88 0-88 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-118.1L7 169c-6.9-6.9-8.9-17.2-5.2-26.2z"/></svg>
                </a>
                
                {#if data.user}
                    <span class="user-greeting">
                        {data.user.username}
                    </span>
                    <form method="POST" action="/logout">
                        <button type="submit" class="logout-btn" aria-label="Déconnexion">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
                                <path d="M96 480h64C177.7 480 192 465.7 192 448S177.7 416 160 416H96c-17.67 0-32-14.33-32-32V128c0-17.67 14.33-32 32-32h64C177.7 96 192 81.67 192 64S177.7 32 160 32H96C42.98 32 0 74.98 0 128v256C0 437 42.98 480 96 480zM504.8 238.5l-144.1-136c-6.975-6.578-17.2-8.375-26-4.594c-8.803 3.797-14.51 12.47-14.51 22.05l-.0918 72l-128-.001c-17.69 0-32.02 14.33-32.02 32v64c0 17.67 14.34 32 32.02 32l128 .001l.0918 71.1c0 9.578 5.707 18.25 14.51 22.05c8.803 3.781 19.03 1.984 26-4.594l144.1-136C514.4 264.4 514.4 247.6 504.8 238.5z"/>
                            </svg>
                        </button>
                    </form>
                {:else}
                    <a href="/login" aria-label="Connexion">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
                            <path d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>
                    </a>
                    <a href="/register" aria-label="Inscription">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="16" height="16" fill="currentColor">
                            <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l448 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm80 256l64 0c44.2 0 80 35.8 80 80c0 8.8-7.2 16-16 16L80 384c-8.8 0-16-7.2-16-16c0-44.2 35.8-80 80-80zm-32-96a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zm256-32l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-128 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-128 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-128 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>
                    </a>
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
        font-size: inherit;
    }
    
    nav a:hover, .logout-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
    
    .user-greeting {
        margin-right: 10px;
        margin-left: 10px;
        margin-bottom: 5px;
        font-weight: bold;
    }
    
    .logout-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2px;
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