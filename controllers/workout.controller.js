const { Workout_Log, medical_checkup, Post, Community_Members } = require("../models");
const { response } = require("../helpers/response.formatter");

function computeStreak(dates) {
    if (!dates || dates.length === 0) return 0;
    const unique = [...new Set(dates)].sort((a, b) => (a > b ? -1 : 1));
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (unique[0] !== today && unique[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < unique.length; i++) {
        const prev = new Date(unique[i - 1]);
        const curr = new Date(unique[i]);
        const diffDays = Math.round((prev - curr) / 86400000);
        if (diffDays === 1) {
            streak += 1;
        } else {
            break;
        }
    }
    return streak;
}

module.exports = {
    createWorkout: async (req, res) => {
        try {
            const { title, category, duration_minutes, completed_date, notes } = req.body;
            const user_id = req.user.id;

            if (!title || !title.trim()) {
                return res.status(400).json(response(400, "Validation Error", "Judul aktivitas wajib diisi"));
            }

            const log = await Workout_Log.create({
                user_id,
                title: title.trim(),
                category: category || "cardio",
                duration_minutes: Number(duration_minutes) || 30,
                completed_date: completed_date || new Date().toISOString().split("T")[0],
                notes: notes || null,
            });

            return res.status(201).json(response(201, "Workout logged successfully", log));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Failed to log workout"));
        }
    },

    getWorkouts: async (req, res) => {
        try {
            const user_id = req.user.id;
            const logs = await Workout_Log.findAll({
                where: { user_id },
                order: [["completed_date", "DESC"], ["createdAt", "DESC"]],
            });
            return res.status(200).json(response(200, "Workouts retrieved successfully", logs));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Failed to retrieve workouts"));
        }
    },

    deleteWorkout: async (req, res) => {
        try {
            const { id } = req.params;
            const log = await Workout_Log.findByPk(id);
            if (!log) return res.status(404).json(response(404, "Not Found", "Workout log not found"));
            if (log.user_id !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json(response(403, "Forbidden", "Not authorized"));
            }
            await log.destroy();
            return res.status(200).json(response(200, "Workout deleted successfully", null));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Failed to delete workout"));
        }
    },

    getSummary: async (req, res) => {
        try {
            const user_id = req.user.id;
            const [workouts, checkups, postCount, commCount] = await Promise.all([
                Workout_Log.findAll({ where: { user_id }, order: [["completed_date", "DESC"]] }),
                medical_checkup.findAll({ where: { user_id }, order: [["date", "DESC"]] }),
                Post.count({ where: { user_id } }),
                Community_Members.count({ where: { user_id } }),
            ]);

            const workoutDates = workouts.map((w) => w.completed_date);
            const streak = computeStreak(workoutDates);

            const sevenDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0];
            const weeklyWorkouts = workouts.filter((w) => w.completed_date >= sevenDaysAgo);
            const weeklyMinutes = weeklyWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);

            const badges = [
                {
                    id: "first_checkup",
                    title: "Pemeriksaan Pertama",
                    description: "Mencatat hasil medical checkup pertama",
                    unlocked: checkups.length >= 1,
                },
                {
                    id: "routine_checkup",
                    title: "Pemantau Rutin",
                    description: "Mencatat minimal 5 riwayat medical checkup",
                    unlocked: checkups.length >= 5,
                },
                {
                    id: "first_workout",
                    title: "Langkah Awal",
                    description: "Menyelesaikan 1 sesi olahraga",
                    unlocked: workouts.length >= 1,
                },
                {
                    id: "streak_3",
                    title: "Konsisten 3 Hari",
                    description: "Menjaga streak olahraga 3 hari berturut-turut",
                    unlocked: streak >= 3,
                },
                {
                    id: "streak_7",
                    title: "Pekan Aktif",
                    description: "Menjaga streak olahraga 7 hari berturut-turut",
                    unlocked: streak >= 7,
                },
                {
                    id: "community_member",
                    title: "Penggerak Komunitas",
                    description: "Bergabung komunitas & berbagi di feed",
                    unlocked: commCount >= 1 && postCount >= 1,
                },
            ];

            return res.status(200).json(response(200, "Summary retrieved", {
                streak,
                total_workouts: workouts.length,
                weekly_workouts: weeklyWorkouts.length,
                weekly_minutes: weeklyMinutes,
                total_checkups: checkups.length,
                badges,
            }));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Failed to compute summary"));
        }
    },
};
