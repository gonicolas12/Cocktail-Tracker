<script>
    import { page } from '$app/stores';
</script>

<div class="error-container">
    <h1>Erreur {$page.status}</h1>
    <p>{$page.error?.message || 'Une erreur est survenue'}</p>
    <button on:click={() => window.location.reload()}>Réessayer</button>
</div>

<style>
    .error-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
        text-align: center;
    }
    button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #4a4a4a;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    button:hover {
        background-color: #333;
    }
</style>