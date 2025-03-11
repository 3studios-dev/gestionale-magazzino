const express = require('express');
const router = express.Router();
const articoloController = require('../controllers/articoloController');

router.get('/', articoloController.getArticoli);
router.get('/:id', articoloController.getArticoloById);
router.post('/', articoloController.addArticolo);

module.exports = router;
