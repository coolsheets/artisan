/**
 * Image Routes
 * 
 * API routes for image uploads and analysis
 */

const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

/**
 * @route POST /api/images/upload
 * @description Upload and analyze an image
 * @access Public
 */
router.post('/upload', imageController.upload, imageController.uploadAndAnalyzeImage);

/**
 * @route POST /api/images/prompt
 * @description Generate prompt suggestions from image analysis
 * @access Public
 */
router.post('/prompt', imageController.generateImagePrompts);

module.exports = router;
