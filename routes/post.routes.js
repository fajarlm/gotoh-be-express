const express = require('express')
const router = express.Router()
const postController = require('../controllers/post.controller')
const upload = require('../middleware/upload')

const { checkAdmin } = require('../middleware/auth')

router.post('/', upload.single('image'), postController.createPost)
router.get('/', postController.getPosts)
router.get('/:id', postController.showPost)
router.put('/:id', upload.single('image'), postController.updatePost)
router.put('/:id/status', checkAdmin, postController.updatePostStatus)
router.delete('/:id', postController.deletePost)

module.exports = router
