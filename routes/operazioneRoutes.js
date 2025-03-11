const express = require('express');
const router = express.Router();
const operazioneController = require('../controllers/operazioneController');

router.post('/', operazioneController.addOperazione);
router.get('/', operazioneController.getOperazioni);

module.exports = router;
