const Validator = require("fastest-validator");
const v = new Validator();
const { medical_checkup,User } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {
    createCheckup: async (req, res) => {
        try {
            const { date, blood_pressure, heart_rate, blood_sugar, cholesterol, weight, height } = req.body;
            const user_id = req.user.id;

            const schema = {
                date: { type: "string", optional: true },
                blood_pressure: { type: "string", optional: true },
                heart_rate: { type: "number", positive: true, integer: true, optional: true },
                blood_sugar: { type: "number", positive: true, optional: true },
                cholesterol: { type: "number", positive: true, optional: true },
                weight: { type: "number", positive: true, optional: true },
                height: { type: "number", positive: true, optional: true },
            };

            const validate = v.validate({
                date, blood_pressure, 
                heart_rate: heart_rate ? Number(heart_rate) : undefined,
                blood_sugar: blood_sugar ? Number(blood_sugar) : undefined,
                cholesterol: cholesterol ? Number(cholesterol) : undefined,
                weight: weight ? Number(weight) : undefined,
                height: height ? Number(height) : undefined,

            }, schema);

            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate));
            }

            const checkup = await medical_checkup.create({
                user_id, date: date || new Date(), blood_pressure, heart_rate, blood_sugar, cholesterol, weight, height
            });

            return res.status(201).json(response(201, "Medical checkup created successfully", checkup));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "An error occurred while creating medical checkup"));
        }
    },
    getCheckups: async (req, res) => {
        try {
            const { user_id } = req.query;
            
            const whereClause = {};
            if (user_id) whereClause.user_id = user_id;

            const checkups = await medical_checkup.findAll({
                where: whereClause,
                include: [
                    {
                        model: User.User,
                        attributes: ['id', 'username', 'avatar']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(response(200, "Medical checkups retrieved successfully", checkups));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while retrieving checkups"));
        }
    },
    getCheckupById: async (req, res) => {
        try {
            const { id } = req.params;
            const checkup = await medical_checkup.findByPk(id);

            if (!checkup) {
                return res.status(404).json(response(404, "Error", "Medical checkup not found"));
            }

            return res.status(200).json(response(200, "Medical checkup retrieved successfully", checkup));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while retrieving checkup"));
        }
    },
    deleteCheckup: async (req, res) => {
        try {
            const { id } = req.params;
            const checkup = await medical_checkup.findByPk(id);

            if (!checkup) {
                return res.status(404).json(response(404, "Error", "Medical checkup not found"));
            }

            await medical_checkup.destroy({ where: { id } });

            return res.status(200).json(response(200, "Medical checkup deleted successfully", null));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while deleting checkup"));
        }
    }
};
