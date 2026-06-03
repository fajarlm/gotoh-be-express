const express = require('express')
const router = express.Router()
const commentController = require('../controllers/comment.controller')
const upload = require('../middleware/upload')

router.post('/', upload.none(), commentController.createComment)
router.get('/', commentController.getComments)
router.delete('/:id', commentController.deleteComment)

module.exports = router
