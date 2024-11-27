const Recette = require('../models/recette');

// Récupérer toutes les recettes
const getRecettes = async (req, res) => {
  try {
    const recettes = await Recette.findAll();
    res.json(recettes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Ajouter une nouvelle recette
const addRecette = async (req, res) => {
  const { nom, ingredients, instructions, image_url } = req.body;
  try {
    const nouvelleRecette = await Recette.create({ nom, ingredients, instructions, image_url });
    res.status(201).json(nouvelleRecette);
  } catch (error) {
    res.status(400).json({ message: 'Impossible d’ajouter la recette.' });
  }
};

module.exports = { getRecettes, addRecette };