const express = require("express");
const router = express.Router();
const workoutController = require("../controllers/workout.controller");

router.get("/", workoutController.getWorkouts);
router.get("/summary", workoutController.getSummary);
router.post("/", workoutController.createWorkout);
router.delete("/:id", workoutController.deleteWorkout);

module.exports = router;
