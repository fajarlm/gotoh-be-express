const express = require('express');
const router = express.Router();
const medicalCheckupController = require('../controllers/medicalCheckup.controller');

router.post('/', medicalCheckupController.createCheckup);
router.get('/', medicalCheckupController.getCheckups);
router.get('/:id', medicalCheckupController.getCheckupById);
router.delete('/:id', medicalCheckupController.deleteCheckup);

module.exports = router;
