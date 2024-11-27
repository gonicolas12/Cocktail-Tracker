const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');

const app = express();

// Connexion à MySQL
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route de base
app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API Cocktails !');
});

// Routes pour les recettes
app.use('/api/recettes', require('./routes/recetteRoutes'));

// Synchroniser la base de données
sequelize.sync({ force: false })
  .then(() => console.log('Base de données synchronisée.'))
  .catch((err) => console.error('Erreur lors de la synchronisation :', err));

// Démarrage du serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
