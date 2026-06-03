const Validator = require("fastest-validator");
const v = new Validator();
const { exercise_recommendation } = require("../models");
const { response } = require("../helpers/response.formatter");

// Static exercise recommendations based on BMI category
const staticRecommendations = {
    "Underweight": {
        recommendation: "Focus on strength training exercises to build muscle mass. Include weight-bearing exercises like resistance training, push-ups, and weight lifting. Combine with balanced nutrition to support muscle development.",
        duration: 60
    },
    "Normal": {
        recommendation: "Maintain your fitness with a mix of cardio and strength training. Perform 150 minutes of moderate-intensity aerobic activity per week, combined with muscle-strengthening activities 2 days per week.",
        duration: 45
    },
    "Overweight": {
        recommendation: "Start with low-impact cardio exercises like walking, swimming, or cycling. Gradually incorporate strength training. Aim for 30-45 minutes of exercise, 5 days per week. Focus on consistency rather than intensity.",
        duration: 45
    },
    "Obese": {
        recommendation: "Begin with gentle, low-impact exercises such as walking or water aerobics. Start with 20-30 minutes, 3-4 times per week. Gradually increase duration and intensity. Consult with a healthcare provider before starting any exercise program.",
        duration: 30
    }
};

module.exports = {
    createRecommendation: async (req, res) => {
        try {
            const { bmi_category, duration, goals, age, gender } = req.body;

            const schema = {
                bmi_category: { type: "string", min: 1, empty: false },
                duration: { type: "number", positive: true, integer: true, optional: true },
                goals: { type: "string", optional: true },
                age: { type: "number", positive: true, integer: true, optional: true },
                gender: { type: "string", optional: true }
            };

            const data = {
                bmi_category: String(bmi_category),
                duration: duration ? Number(duration) : undefined,
                goals: goals,
                age: age ? Number(age) : undefined,
                gender: gender
            };

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate));
            }

            const generated = staticRecommendations[data.bmi_category] || staticRecommendations["Normal"];

            const rec = await exercise_recommendation.create({
                bmi_category: data.bmi_category,
                recommendation: generated.recommendation,
                duration: generated.duration
            });

            return res.status(201).json(response(201, "Recommendation created successfully", rec));
        } catch (error) {
            return res.status(500).json(response(500, "Error", error.message || "An error occurred while creating recommendation"));
        }
    },
    getRecommendations: async (req, res) => {
        try {
            const { bmi_category } = req.query;
            
            const whereClause = {};
            if (bmi_category) whereClause.bmi_category = bmi_category;

            const recs = await exercise_recommendation.findAll({
                where: whereClause
            });

            return res.status(200).json(response(200, "Recommendations retrieved successfully", recs));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while retrieving recommendations"));
        }
    },
    deleteRecommendation: async (req, res) => {
        try {
            const { id } = req.params;
            const rec = await exercise_recommendation.findByPk(id);

            if (!rec) {
                return res.status(404).json(response(404, "Error", "Recommendation not found"));
            }

            await exercise_recommendation.destroy({ where: { id } });

            return res.status(200).json(response(200, "Recommendation deleted successfully", null));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while deleting recommendation"));
        }
    }
};
