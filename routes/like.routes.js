const express = require('express')
const router = express.Router()
const likeController = require('../controllers/like.controller')
const upload = require('../middleware/upload')

router.post('/', upload.none(), likeController.toggleLike)
router.get('/', likeController.getLikes)

module.exports = router
