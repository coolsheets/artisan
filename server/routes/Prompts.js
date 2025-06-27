const express = require('express');
const router = express.Router();
const { createPrompt, getPrompts } = require('../controllers/promptController');

router.post('/', createPrompt);
router.get('/', getPrompts);

module.exports = router;
