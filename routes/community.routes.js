const express = require('express')
const router = express.Router()
const communityController = require('../controllers/community.controller')
const upload = require('../middleware/upload')

router.get('/', communityController.getCommunity)
router.post('/', upload.single('cover'), communityController.createCommunity)
router.get('/:id', communityController.showCommunity)
router.put('/:id', upload.single('cover'), communityController.updateCommunity)
router.delete('/:id', communityController.deleteCommunity)
router.post('/:id/join', communityController.joinCommunity)
router.delete('/:id/leave', communityController.leaveCommunity)

module.exports = router