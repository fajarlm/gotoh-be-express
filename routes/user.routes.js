const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const upload = require('../middleware/upload')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware.checkAdmin, userController.getUsers)
router.get('/profile', userController.getProfile)
router.put('/profile', upload.single('avatar'), userController.updateProfile)
router.get('/profile/:id', userController.showUser)
router.delete('/profile/:id', authMiddleware.checkAdmin, userController.deleteUser)

module.exports = router
