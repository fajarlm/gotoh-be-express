const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/challenge.controller");

router.get("/", challengeController.getChallenges);
router.post("/", challengeController.createChallenge);
router.post("/:id/join", challengeController.joinChallenge);
router.post("/:id/checkin", challengeController.checkinChallenge);

module.exports = router;
