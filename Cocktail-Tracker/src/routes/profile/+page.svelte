<script lang="ts">
    import { enhance } from '$app/forms';
    import CocktailCard from '$lib/components/CocktailCard.svelte';
    import type { Cocktail } from '$lib/types/cocktail';
    
    export let data;
    export let form;
    
    // Récupérer les données du serveur
    $: user = data.user;
    
    // Vérifier la structure des données et les transformer si nécessaire
    $: userCocktails = Array.isArray(data.userCocktails) 
        ? data.userCocktails.map((c: any) => ({
            id: c.id,
            title: c.title,
            ingredients: c.ingredients || [],
            likes: c.likes || 0,
            dislikes: c.dislikes || 0,
            created_at: c.created_at,
            created_by: c.created_by,
            user_username: c.user_username
          })) as Cocktail[]
        : [];
    
    $: likedCocktails = Array.isArray(data.likedCocktails) 
        ? data.likedCocktails.map((c: any) => ({
            id: c.id,
            title: c.title,
            ingredients: c.ingredients || [],
            likes: c.likes || 0,
            dislikes: c.dislikes || 0,
            created_at: c.created_at,
            created_by: c.created_by,
            user_username: c.user_username
          })) as Cocktail[]
        : [];
    
    $: dislikedCocktails = Array.isArray(data.dislikedCocktails) 
        ? data.dislikedCocktails.map((c: any) => ({
            id: c.id,
            title: c.title,
            ingredients: c.ingredients || [],
            likes: c.likes || 0,
            dislikes: c.dislikes || 0,
            created_at: c.created_at,
            created_by: c.created_by,
            user_username: c.user_username
          })) as Cocktail[]
        : [];
    
    // Variable pour l'édition du profil
    let editMode = false;
    let username = user?.username || '';
    let loading = false;
    
    // Affichage par onglets
    let activeTab = 'myRecipes'; // 'myRecipes', 'liked', 'disliked'
    
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
    
    // Fonction simplifiée pour utiliser enhance
    function handleSubmit() {
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
</script>