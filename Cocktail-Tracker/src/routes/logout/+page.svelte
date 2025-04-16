<script>
    // Ce fichier est nécessaire pour que la route /logout fonctionne,
    // mais le contenu ne sera jamais rendu car la route redirige immédiatement
</script>

<div class="logout-container">
    <h1>Déconnexion en cours...</h1>
    <p>Veuillez patienter, vous allez être redirigé.</p>
    
    <!-- Formulaire de secours si JavaScript est désactivé -->
    <form method="POST" action="/logout">
        <button type="submit">Cliquez ici si vous n'êtes pas redirigé</button>
    </form>
</div>

<style>
    .logout-container {
        max-width: 500px;
        margin: 100px auto;
        text-align: center;
        padding: 20px;
    }
    
    button {
        margin-top: 20px;
        padding: 10px 15px;
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
</style>