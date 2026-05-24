const express = require('express')
const router = express.Router()

const authController = require('../controllers/auth.controller')
const upload = require('../middleware/upload')

router.post('/login',authController.login);
router.post('/register',authController.register);

module.exports = router