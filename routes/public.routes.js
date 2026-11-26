const express = require("express");
const router = express.Router();
const publicController = require("../controllers/public.controller");

router.get("/overview", publicController.getOverview);

module.exports = router;
