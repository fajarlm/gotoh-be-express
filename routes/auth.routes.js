const express = require('express')
const router = express.Router()

const authController = require('../controllers/auth.controller')
const upload = require('../middleware/upload')

router.post('/login',upload.none(),authController.login);
router.post('/register',upload.none(),authController.register);

module.exports = router