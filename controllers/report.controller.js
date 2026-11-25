const { Post_Report, Post, User } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {
    createReport: async (req, res) => {
        try {
            const { post_id, reason, details } = req.body;
            const reporter_id = req.user.id;

            if (!post_id || !reason) {
                return res.status(400).json(response(400, "Validation Error", "post_id dan alasan wajib diisi"));
            }

            const post = await Post.findByPk(post_id);
            if (!post) {
                return res.status(404).json(response(404, "Not Found", "Postingan tidak ditemukan"));
            }

            const report = await Post_Report.create({
                post_id: Number(post_id),
                reporter_id,
                reason,
                details: details || null,
                status: "pending",
            });

            return res.status(201).json(response(201, "Laporan berhasil dikirim", report));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Gagal mengirim laporan"));
        }
    },

    getReports: async (req, res) => {
        try {
            const { status } = req.query;
            const where = status ? { status } : {};

            const reports = await Post_Report.findAll({
                where,
                include: [
                    {
                        model: Post,
                        include: [{ model: User, attributes: ["id", "username", "email"] }],
                    },
                    {
                        model: User,
                        as: "Reporter",
                        attributes: ["id", "username", "email"],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            return res.status(200).json(response(200, "Reports retrieved", reports));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Gagal memuat laporan"));
        }
    },

    updateReportStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, action } = req.body; // status: 'reviewed' | 'dismissed', action: 'reject_post' | 'none'

            const report = await Post_Report.findByPk(id);
            if (!report) {
                return res.status(404).json(response(404, "Not Found", "Laporan tidak ditemukan"));
            }

            report.status = status || "reviewed";
            await report.save();

            if (action === "reject_post") {
                const post = await Post.findByPk(report.post_id);
                if (post) {
                    post.status = "rejected";
                    await post.save();
                }
            }

            return res.status(200).json(response(200, "Status laporan diperbarui", report));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Gagal memperbarui laporan"));
        }
    },
};
