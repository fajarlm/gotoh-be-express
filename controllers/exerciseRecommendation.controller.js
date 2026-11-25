const Validator = require("fastest-validator");
const v = new Validator();
const { exercise_recommendation, User } = require("../models");
const { response } = require("../helpers/response.formatter");

// Personalized exercise recommendations based on BMI category + health_target
const staticRecommendations = {
    "Underweight": {
        recommendation: "Fokus pada latihan kekuatan (strength training) untuk membangun massa otot: push-up, squat, resistance band, dan angkat beban ringan. Imbangi dengan asupan kalori & protein berkualitas.",
        duration: 45
    },
    "Normal": {
        recommendation: "Pertahankan kebugaran dengan kombinasi kardio dan latihan kekuatan. Lakukan 150 menit aktivitas aerobik intensitas sedang per minggu ditambah latihan otot 2 hari per minggu.",
        duration: 45
    },
    "Overweight": {
        recommendation: "Mulai dengan kardio low-impact seperti jalan cepat, berenang, atau bersepeda 30-45 menit sebanyak 5x seminggu. Tambahkan latihan beban ringan 2x seminggu untuk menjaga metabolisme.",
        duration: 40
    },
    "Obese": {
        recommendation: "Awali dengan gerakan low-impact ramah sendi seperti jalan santai, sepeda statis, atau senam air selama 20-30 menit, 3-4x seminggu. Tingkatkan durasi bertahap sesuai kenyamanan tubuh.",
        duration: 30
    }
};

function buildPersonalizedRecommendation({ bmi_category, health_target, blood_pressure, blood_sugar }) {
    const base = staticRecommendations[bmi_category] || staticRecommendations["Normal"];
    let rec = base.recommendation;
    let duration = base.duration;

    if (health_target === 'menurunkan_berat_badan') {
        rec += " | Target Penurunan BB: Prioritaskan zona pembakaran lemak (jalan cepat/bersepeda konstan) dan defisit kalori terukur.";
        duration = Math.max(duration, 45);
    } else if (health_target === 'membangun_otot') {
        rec += " | Target Massa Otot: Utamakan progressive overload 3-4x/minggu dengan istirahat cukup dan asupan protein ~1.6g/kg BB.";
        duration = Math.max(duration, 50);
    } else if (health_target === 'gaya_hidup_sehat') {
        rec += " | Target Gaya Hidup Sehat: Jaga konsistensi harian, sisipkan peregangan 10 menit dan aktivitas luar ruang.";
    }

    if (blood_pressure && typeof blood_pressure === 'string' && blood_pressure.includes('/')) {
        const sys = parseInt(blood_pressure.split('/')[0], 10);
        if (!isNaN(sys) && sys >= 140) {
            rec += " | Catatan Tekanan Darah: Hindari latihan menahan napas (Valsalva) atau HIIT berat; pilih jalan santai & pernapasan teratur.";
            duration = Math.min(duration, 30);
        }
    }

    if (blood_sugar && Number(blood_sugar) >= 200) {
        rec += " | Catatan Gula Darah: Lakukan olahraga ringan setelah makan (jalan kaki 15-20 menit) dan pantau hidrasi.";
    }

    return { recommendation: rec, duration };
}

module.exports = {
    createRecommendation: async (req, res) => {
        try {
            const { bmi_category, duration, goals, age, gender, blood_pressure, blood_sugar } = req.body;

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

            let userTarget = goals;
            if (!userTarget && req.user?.id) {
                const user = await User.findByPk(req.user.id, { attributes: ['health_target'] });
                userTarget = user?.health_target;
            }

            const generated = buildPersonalizedRecommendation({
                bmi_category: data.bmi_category,
                health_target: userTarget,
                blood_pressure,
                blood_sugar
            });

            const rec = await exercise_recommendation.create({
                bmi_category: data.bmi_category,
                recommendation: generated.recommendation,
                duration: data.duration || generated.duration
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
