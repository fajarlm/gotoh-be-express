const { Article, User } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {
    getArticles: async (req, res) => {
        try {
            const { category, all } = req.query;
            const isAdmin = req.user?.role === "admin" || req.user?.user_role === "admin";
            const where = {};
            if (category && category !== "all") where.category = category;
            if (!(isAdmin && all === "true")) where.is_published = true;

            const articles = await Article.findAll({
                where,
                include: [{ model: User, as: "Author", attributes: ["id", "username"] }],
                order: [["createdAt", "DESC"]],
            });
            return res.status(200).json(response(200, "Articles retrieved", articles));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Gagal memuat artikel"));
        }
    },

    createArticle: async (req, res) => {
        try {
            const { title, category, summary, content, read_time, is_published } = req.body;
            if (!title || !summary || !content) {
                return res.status(400).json(response(400, "Validation Error", "Judul, ringkasan, dan isi artikel wajib diisi"));
            }

            const article = await Article.create({
                author_id: req.user.id,
                title: title.trim(),
                category: category || "umum",
                summary: summary.trim(),
                content: content.trim(),
                read_time: Number(read_time) || 3,
                is_published: is_published !== undefined ? Boolean(is_published) : true,
            });

            return res.status(201).json(response(201, "Artikel berhasil dipublikasikan", article));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Gagal membuat artikel"));
        }
    },

    deleteArticle: async (req, res) => {
        try {
            const { id } = req.params;
            const article = await Article.findByPk(id);
            if (!article) return res.status(404).json(response(404, "Not Found", "Artikel tidak ditemukan"));
            await article.destroy();
            return res.status(200).json(response(200, "Artikel dihapus", null));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Gagal menghapus artikel"));
        }
    },
};
