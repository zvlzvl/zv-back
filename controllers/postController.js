const postSchema = require("../schemas/postSchema");
const userSchema = require("../schemas/userSchema");
module.exports = {
    getPosts: async (req, res) => {
        const posts = await postSchema
            .find()
            .populate("createdBy", "username")
            .sort({ created_at: -1 }); // Sort by created_at in descending order

        if (posts.length === 0) {
            return res.status(400).json({error: "No posts"});
        }
        return res.status(200).json(posts);
    },
    getFavorite: async (req, res) => {
        const {authUser} = req.body;

        const user = await userSchema.findOne({ _id: authUser.id }).select("favorites");
        if (!user || !user.favorites.length) {
            return res.status(200).json([]); // No favorite posts
        }

        const usersFavoritePosts = await postSchema
            .find({ _id: { $in: user.favorites } })
            .populate("createdBy", "username image") // Fetch post creator details
            .select("title image created_at description comments createdBy");

        return res.status(200).json(usersFavoritePosts);
    },
    getPost: async (req, res) => {
        const {postId} = req.params;
        const post = await postSchema
            .findById(postId)
            .populate("createdBy", "username")
            .populate("comments.sender", "username image created_at");

        return res.status(200).json(post);
    },
    create: async (req, res) => {
        const {title, description, image} = req.body;
        const {authUser} = req.body;
        let newPost = new postSchema({
            title,
            createdBy: authUser.id,
            description,
            image,
        })
        await newPost.save();
        return res.json({message: "Post added successfully."});
    },
    addComment: async (req, res) => {
        const {sender, content} = req.body;
        const {postId} = req.params;

        const post = await postSchema
            .findById(postId)
            .populate("createdBy", "username")
            .populate("comments.sender", "username image");

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const newComment = {
            sender,
            content,
        };
        post.comments.push(newComment);
        await post.save();
        const newPost = await postSchema
            .findById(postId)
            .populate("createdBy", "username")
            .populate("comments.sender", "username image");
        res.status(200).json({ message: "Comment added successfully", post:newPost });
    },
}