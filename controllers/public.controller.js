const {
    User,
    Community,
    Community_Members,
    Post,
    Like,
    Comment,
    medical_checkup,
    Workout_Log,
    Challenge,
    Challenge_Participant,
    Article,
} = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {
    getOverview: async (req, res) => {
        try {
            const [
                usersCount,
                communitiesCount,
                checkupsCount,
                postsCount,
                workoutsCount,
                challengesCount,
                rawCommunities,
                rawPosts,
                rawChallenges,
                rawArticles,
            ] = await Promise.all([
                User.count({ where: { status: "active" } }).catch(() => User.count()),
                Community.count().catch(() => 0),
                medical_checkup.count().catch(() => 0),
                Post.count({ where: { type: "public", status: "approved" } }).catch(() => 0),
                Workout_Log ? Workout_Log.count().catch(() => 0) : Promise.resolve(0),
                Challenge ? Challenge.count().catch(() => 0) : Promise.resolve(0),
                Community.findAll({
                    attributes: ["id", "name", "description", "location", "cover_image", "createdAt"],
                    include: [{ model: User, attributes: ["id"], through: { attributes: [] } }],
                    order: [["createdAt", "DESC"]],
                    limit: 8,
                }).catch(() => []),
                Post.findAll({
                    where: { type: "public", status: "approved" },
                    attributes: ["id", "content", "createdAt"],
                    include: [
                        { model: User, attributes: ["id", "username"] },
                        { model: Like, attributes: ["id"] },
                        { model: Comment, attributes: ["id"] },
                    ],
                    order: [["createdAt", "DESC"]],
                    limit: 3,
                }).catch(() => []),
                Challenge
                    ? Challenge.findAll({
                          attributes: ["id", "title", "description", "target_days", "unit", "createdAt"],
                          include: [
                              { model: Community, attributes: ["id", "name"] },
                              { model: Challenge_Participant, attributes: ["id"] },
                          ],
                          order: [["createdAt", "DESC"]],
                          limit: 3,
                      }).catch(() => [])
                    : Promise.resolve([]),
                Article
                    ? Article.findAll({
                          where: { is_published: true },
                          attributes: ["id", "title", "category", "summary", "read_time", "createdAt"],
                          order: [["createdAt", "DESC"]],
                          limit: 3,
                      }).catch(() => [])
                    : Promise.resolve([]),
            ]);

            const communities = rawCommunities
                .map((c) => {
                    const j = c.toJSON();
                    return {
                        id: j.id,
                        name: j.name,
                        description: j.description,
                        location: j.location,
                        cover_image: j.cover_image,
                        members_count: Array.isArray(j.Users) ? j.Users.length : 0,
                    };
                })
                .sort((a, b) => b.members_count - a.members_count);

            const recent_posts = rawPosts.map((p) => {
                const j = p.toJSON();
                return {
                    id: j.id,
                    content: j.content,
                    createdAt: j.createdAt,
                    username: j.User?.username || "Anggota",
                    likes_count: Array.isArray(j.Likes) ? j.Likes.length : 0,
                    comments_count: Array.isArray(j.Comments) ? j.Comments.length : 0,
                };
            });

            const challenges = rawChallenges.map((ch) => {
                const j = ch.toJSON();
                return {
                    id: j.id,
                    title: j.title,
                    description: j.description,
                    target_days: j.target_days,
                    unit: j.unit,
                    community_name: j.Community?.name || null,
                    participants_count: Array.isArray(j.Challenge_Participants)
                        ? j.Challenge_Participants.length
                        : 0,
                };
            });

            return res.status(200).json(
                response(200, "Public overview retrieved", {
                    stats: {
                        users: usersCount,
                        communities: communitiesCount,
                        checkups: checkupsCount,
                        posts: postsCount,
                        workouts: workoutsCount,
                        challenges: challengesCount,
                    },
                    communities,
                    recent_posts,
                    challenges,
                    articles: rawArticles,
                })
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "Failed to load public overview"));
        }
    },
};
