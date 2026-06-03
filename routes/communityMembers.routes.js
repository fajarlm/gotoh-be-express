const express = require('express')
const router = express.Router()
const communityMembersController = require('../controllers/communityMembers.controller')
const authMiddleware = require('../middleware/auth')

router.get('/:id', communityMembersController.getCommunityMembers)
router.delete('/:id', authMiddleware.checkAdmin, communityMembersController.deleteCommunityMember)

module.exports = router
