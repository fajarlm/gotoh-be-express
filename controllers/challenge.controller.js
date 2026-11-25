const { Challenge, Challenge_Participant, Community, User } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {
    getChallenges: async (req, res) => {
        try {
            const { community_id } = req.query;
            const where = community_id ? { community_id } : {};
            const userId = req.user.id;

            const challenges = await Challenge.findAll({
                where,
                include: [
                    { model: Community, attributes: ["id", "name"] },
                    { model: User, as: "Creator", attributes: ["id", "username"] },
                    {
                        model: Challenge_Participant,
                        include: [{ model: User, attributes: ["id", "username", "avatar"] }],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            const formatted = challenges.map((c) => {
                const json = c.toJSON();
                const participants = (json.Challenge_Participants || []).sort((a, b) => b.progress - a.progress);
                const myParticipation = participants.find((p) => p.user_id === userId) || null;
                return {
                    ...json,
                    participants_count: participants.length,
                    leaderboard: participants.slice(0, 5),
                    my_participation: myParticipation,
                };
            });

            return res.status(200).json(response(200, "Challenges retrieved", formatted));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Gagal memuat tantangan"));
        }
    },

    createChallenge: async (req, res) => {
        try {
            const { community_id, title, description, target_days, unit, start_date, end_date } = req.body;
            if (!title) {
                return res.status(400).json(response(400, "Validation Error", "Judul tantangan wajib diisi"));
            }

            const challenge = await Challenge.create({
                community_id: community_id ? Number(community_id) : null,
                creator_id: req.user.id,
                title: title.trim(),
                description: description || "",
                target_days: Number(target_days) || 7,
                unit: unit || "hari",
                start_date: start_date || new Date().toISOString().split("T")[0],
                end_date: end_date || null,
            });

            await Challenge_Participant.create({
                challenge_id: challenge.id,
                user_id: req.user.id,
                progress: 0,
            });

            return res.status(201).json(response(201, "Tantangan berhasil dibuat", challenge));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Gagal membuat tantangan"));
        }
    },

    joinChallenge: async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.user.id;
            const challenge = await Challenge.findByPk(id);
            if (!challenge) return res.status(404).json(response(404, "Not Found", "Tantangan tidak ditemukan"));

            const [participant, created] = await Challenge_Participant.findOrCreate({
                where: { challenge_id: id, user_id },
                defaults: { progress: 0 },
            });

            return res.status(created ? 201 : 200).json(response(200, created ? "Berhasil bergabung" : "Sudah bergabung", participant));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Gagal bergabung ke tantangan"));
        }
    },

    checkinChallenge: async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.user.id;
            const today = new Date().toISOString().split("T")[0];

            const challenge = await Challenge.findByPk(id);
            if (!challenge) return res.status(404).json(response(404, "Not Found", "Tantangan tidak ditemukan"));

            let participant = await Challenge_Participant.findOne({
                where: { challenge_id: id, user_id },
            });

            if (!participant) {
                participant = await Challenge_Participant.create({
                    challenge_id: id,
                    user_id,
                    progress: 0,
                });
            }

            if (participant.last_checkin_date === today) {
                return res.status(400).json(response(400, "Already Checked In", "Anda sudah check-in hari ini untuk tantangan ini"));
            }

            participant.progress = Math.min(challenge.target_days, participant.progress + 1);
            participant.last_checkin_date = today;
            await participant.save();

            return res.status(200).json(response(200, "Check-in berhasil!", participant));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Gagal melakukan check-in"));
        }
    },
};
