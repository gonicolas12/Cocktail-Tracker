const express = require('express');
const router = express.Router();
const { getRecettes, addRecette } = require('../controllers/recetteController');

// Routes
router.get('/', getRecettes);
router.post('/', addRecette);

module.exports = router;