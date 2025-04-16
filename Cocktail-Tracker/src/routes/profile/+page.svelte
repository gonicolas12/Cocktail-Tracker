<script lang="ts">
    import { enhance } from '$app/forms';
    import CocktailCard from '$lib/components/CocktailCard.svelte';
    import type { Cocktail } from '$lib/types/cocktail';
    
    export let data;
    export let form;
    
    // Debug
    console.log("Données du profil:", data);
    
    // Récupérer les données du serveur
    $: user = data.user;
    
    // Transformation plus simple des données
    $: userCocktails = data.userCocktails || [];
    $: likedCocktails = data.likedCocktails || [];
    $: dislikedCocktails = data.dislikedCocktails || [];
    
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
    
    // Gérer la soumission du formulaire
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