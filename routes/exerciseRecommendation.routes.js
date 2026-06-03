const express = require('express')
const router = express.Router()
const exerciseRecommendationController = require('../controllers/exerciseRecommendation.controller')
const upload = require('../middleware/upload')

router.post('/', upload.none(), exerciseRecommendationController.createRecommendation)
router.get('/', exerciseRecommendationController.getRecommendations)
router.delete('/:id', exerciseRecommendationController.deleteRecommendation)

module.exports = router
