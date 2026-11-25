const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const { checkAdmin } = require("../middleware/auth");

router.post("/", reportController.createReport);
router.get("/", checkAdmin, reportController.getReports);
router.put("/:id", checkAdmin, reportController.updateReportStatus);

module.exports = router;
