<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import SearchBar from '$lib/components/SearchBar.svelte';
    import '../app.css';
    
    export let data;
    
    // Récupérer les données de l'utilisateur
    $: user = data.user;
    
    // Détecter la page active pour la navigation
    $: pathname = $page.url.pathname;
    
    let mobileMenuOpen = false;
    let searchOpen = false;
    let searchTerm = '';
    
    // Gérer la recherche dans le header
    function handleSearch(event: CustomEvent<string>): void {
        const term = event.detail || '';
        goto(`/?search=${encodeURIComponent(term)}`);
        
        // Fermer le menu mobile et la barre de recherche après la recherche
        mobileMenuOpen = false;
        searchOpen = false;
    }
    
    // Gérer la déconnexion
    async function handleLogout(): Promise<void> {
        await goto('/logout');
    }
</script>

<div class="app-container">
    <header class="main-header">
        <div class="header-content">
            <div class="logo-container">
                <a href="/" class="logo">🍹 Cocktail Tracker</a>
            </div>
            
            <div class="mobile-controls">
                <!-- Bouton de recherche mobile -->
                <button class="icon-btn search-btn" on:click={() => searchOpen = !searchOpen} aria-label="Rechercher">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
                
                <!-- Bouton menu hamburger -->
                <button class="icon-btn menu-btn" on:click={() => mobileMenuOpen = !mobileMenuOpen}>
                    {#if mobileMenuOpen}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    {/if}
                </button>
            </div>
            
            <div class="desktop-search">
                <SearchBar on:search={handleSearch} />
            </div>
            
            <nav class="desktop-nav">
                <ul class="nav-links">
                    <li>
                        <a href="/" class:active={pathname === '/'}>Accueil</a>
                    </li>
                    {#if user}
                        <li>
                            <a href="/create" class:active={pathname === '/create'}>Créer</a>
                        </li>
                        <li class="user-menu">
                            <span class="username">{user.username}</span>
                            <div class="dropdown-menu">
                                <a href="/profile">Mon profil</a>
                                <button on:click={handleLogout} class="logout-btn">Déconnexion</button>
                            </div>
                        </li>
                    {:else}
                        <li>
                            <a href="/login" class:active={pathname === '/login'}>Connexion</a>
                        </li>
                        <li>
                            <a href="/register" class:active={pathname === '/register'}>Inscription</a>
                        </li>
                    {/if}
                </ul>
            </nav>
        </div>
        
        <!-- Barre de recherche mobile -->
        {#if searchOpen}
            <div class="mobile-search">
                <SearchBar bind:value={searchTerm} on:search={handleSearch} />
            </div>
        {/if}
        
        <!-- Menu mobile -->
        {#if mobileMenuOpen}
            <nav class="mobile-nav">
                <ul class="nav-links">
                    <li>
                        <a 
                            href="/" 
                            class:active={pathname === '/'} 
                            on:click={() => mobileMenuOpen = false}
                        >
                            Accueil
                        </a>
                    </li>
                    {#if user}
                        <li>
                            <a 
                                href="/create" 
                                class:active={pathname === '/create'} 
                                on:click={() => mobileMenuOpen = false}
                            >
                                Créer un cocktail
                            </a>
                        </li>
                        <li>
                            <a 
                                href="/profile" 
                                class:active={pathname === '/profile'} 
                                on:click={() => mobileMenuOpen = false}
                            >
                                Mon profil
                            </a>
                        </li>
                        <li>
                            <button on:click={handleLogout} class="logout-btn">
                                Déconnexion
                            </button>
                        </li>
                    {:else}
                        <li>
                            <a 
                                href="/login" 
                                class:active={pathname === '/login'} 
                                on:click={() => mobileMenuOpen = false}
                            >
                                Connexion
                            </a>
                        </li>
                        <li>
                            <a 
                                href="/register" 
                                class:active={pathname === '/register'} 
                                on:click={() => mobileMenuOpen = false}
                            >
                                Inscription
                            </a>
                        </li>
                    {/if}
                </ul>
            </nav>
        {/if}
    </header>
    
    <main>
        <slot />
    </main>
    
    <footer class="main-footer">
        <div class="footer-content">
            <div class="footer-logo">
                <span>🍹 Cocktail Tracker</span>
            </div>
            <p class="copyright">© {new Date().getFullYear()} - Tous droits réservés</p>
        </div>
    </footer>
</div>

<style>
    .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    
    .main-header {
        background-color: #4a90e2;
        color: white;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 100;
    }
    
    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
    }
    
    .logo-container {
        display: flex;
        align-items: center;
    }
    
    .logo {
        font-size: 1.5rem;
        font-weight: bold;
        color: white;
        text-decoration: none;
    }
    
    .mobile-controls {
        display: none;
    }
    
    .nav-links {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
        gap: 25px;
    }
    
    .nav-links a {
        color: white;
        text-decoration: none;
        font-weight: 500;
        position: relative;
        transition: opacity 0.2s;
    }
    
    .nav-links a:hover {
        opacity: 0.8;
    }
    
    .nav-links a.active::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: white;
        border-radius: 2px;
    }
    
    .user-menu {
        position: relative;
    }
    
    .username {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .username::after {
        content: '▼';
        font-size: 8px;
    }
    
    .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        min-width: 150px;
        display: none;
        z-index: 10;
        margin-top: 10px;
    }
    
    .user-menu:hover .dropdown-menu {
        display: block;
    }
    
    .dropdown-menu a, .dropdown-menu button {
        display: block;
        padding: 10px 15px;
        color: #333;
        text-decoration: none;
        text-align: left;
        width: 100%;
        background: none;
        border: none;
        cursor: pointer;
    }
    
    .dropdown-menu a:hover, .dropdown-menu button:hover {
        background-color: #f5f5f5;
    }
    
    .logout-btn {
        color: #ff4d4f;
    }
    
    main {
        flex: 1;
    }
    
    .main-footer {
        background-color: #333;
        color: white;
        padding: 20px;
        margin-top: 40px;
    }
    
    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }
    
    .footer-logo {
        font-weight: bold;
        font-size: 1.2rem;
    }
    
    .copyright {
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.8;
    }
    
    .desktop-search {
        flex: 1;
        max-width: 400px;
        margin: 0 20px;
    }
    
    /* Styles responsive */
    @media (max-width: 768px) {
        .desktop-nav, .desktop-search {
            display: none;
        }
        
        .mobile-controls {
            display: flex;
            gap: 10px;
        }
        
        .icon-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .mobile-nav {
            background-color: #3a7bc8;
            padding: 10px 20px 20px;
        }
        
        .mobile-nav .nav-links {
            flex-direction: column;
            gap: 15px;
        }
        
        .mobile-nav a, .mobile-nav button {
            display: block;
            padding: 10px 0;
            font-size: 1.1rem;
        }
        
        .mobile-search {
            padding: 0 20px 20px;
            background-color: #3a7bc8;
        }
    }
</style>