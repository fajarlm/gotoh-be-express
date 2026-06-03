const express = require('express')
const router = express.Router()
const chatMessageController = require('../controllers/chatMessage.controller')
const upload = require('../middleware/upload')

router.get('/:community_id', chatMessageController.getMessages)
router.post('/', upload.single('image_message'), chatMessageController.createMessage)

module.exports = router
