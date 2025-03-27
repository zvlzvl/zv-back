const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const userSchema = require("../schemas/userSchema");
const postSchema = require("../schemas/postSchema");
const messageSchema = require("../schemas/messageSchema");

module.exports = {
    getUser: async (req, res) => {
        const {userId} = req.params;
        const userData = await userSchema.findById(userId, {password: 0});
        if (!userData) {
            return res.status(404).json({message: "User not found"});
        }
        const posts = await postSchema.find({createdBy: userId}).populate("createdBy", "username");
        return res.status(200).json({user: userData, posts: posts});
    },
    getUsers: async (req, res) => {
        const users = await userSchema.find({}, {password: 0});
        return res.status(200).json(users);
    },
    update: async (req, res) => {
        const {authUser, _id, updateFields} = req.body;
        const authUserData = await userSchema.findById(authUser.id)
        if (!authUserData) return res.status(401).json({error: "User does not exist"});
        //update username validation
        let newUsername = updateFields.username;
        if (newUsername !== undefined) {
            const minUsernameLength = 4;
            const maxUsernameLength = 20;
            if (newUsername === "") return res.status(400).json({error: "username required"});
            if (newUsername.length < minUsernameLength || newUsername.length > maxUsernameLength) return res.status(400).json({error: "username length should be between " + minUsernameLength + "and " + maxUsernameLength});
            if (authUserData.username === newUsername) return res.status(400).json({error: "You already have this username"});

            const existingUser = await userSchema.findOne({username: newUsername});
            if (existingUser) return res.status(400).json({error: "Username already taken"});
        }
        // update image validation
        let image = updateFields.image;
        if (image !== undefined){
            if (image === "") return res.status(400).json({error: "Image url required"});

            const isValidImg = validateImageUrl(updateFields.image);
            if (!isValidImg) return res.status(400).json({error: "Invalid image url"});
        }

        let user = await userSchema.findOneAndUpdate(
            {_id: _id},  // Find the user by id
            {$set: updateFields},  // Dynamically update fields
            {new: true, projection: {password: 0}}  // Return updated doc, exclude password
        );

        if (!user) {
            return res.status(401).json({error: "User not found"});
        } else {
            let allUsers = await userSchema.find({})
            return res.status(200).send({users: allUsers, user: user});
        }

        function validateImageUrl(url) {
            const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
            return imageExtensions.test(url)
        }
    },
    changePassword: async (req, res) => {
        const {authUser, newPassword} = req.body;
        const user = await userSchema.findOne({_id: authUser.id});
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        let updatedUser = await userSchema.findOneAndUpdate(
            {_id: authUser.id},
            {$set: {password: hashedPassword}},
            {new: true, projection: {password: 0}}  // Return updated doc, exclude password
        );

        return res.status(200).json({
            message: "ok",
            user: updatedUser,
            // user: {username: updatedUser.username, _id: updatedUser._id, image: updatedUser.image, favorites: updatedUser.favorites, token}
        });
    },
    register: async (req, res) => {
        const {username, password} = req.body;
        const existingUser = await userSchema.findOne({username: username});
        if (existingUser) {
            return res.status(400).json({error: "Username already taken"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userSchema({
            username: username,
            password: hashedPassword,
            image: "data:image/png;base64,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",
        })

        await newUser.save();
        return res.status(200).json({message: "Registration successfully"});
    },
    login: async (req, res) => {
        const {username, password} = req.body;
        const findUser = await userSchema.findOne({username: username});
        if (!findUser) {
            return res.status(400).json({error: "Invalid credentials"});
        }
        const isPasswordValid = await bcrypt.compare(password, findUser.password);

        if (!isPasswordValid) return res.status(401).json({error: "Invalid credentials"});
        const token = jwt.sign({id: findUser._id}, process.env.SECRET_KEY)
        const messages = await messageSchema.find({getter: findUser._id}).populate("sender", "username image");

        return res.status(200).json({
            messages: messages,
            user: {username: username, _id: findUser._id, image: findUser.image, favorites: findUser.favorites, token}
        });
    },
    delete: async (req, res) => {
        try {
            const {authUser, password} = req.body;

            // Find user
            const findUser = await userSchema.findById(authUser.id);
            if (!findUser) return res.status(404).send({error: "User not found"});

            // Check password
            const isPasswordValid = await bcrypt.compare(password, findUser.password);
            if (!isPasswordValid) return res.status(401).send({error: "Invalid credentials"});

            // Remove posts from all other users' favorites
            const posts = await postSchema.find({createdBy: authUser.id});
            await Promise.all(
                posts.map((post) =>
                    userSchema.updateMany(
                        { favorites: post._id },
                        { $pull: { favorites: post._id } }
                    )
                )
            );
            //remove Posts
            await postSchema.deleteMany({ createdBy: authUser.id });

            //remove messages

            await messageSchema.deleteMany({
                $or: [
                    { sender: authUser.id },
                    { getter: authUser.id }
                ]
            });

            // Delete the user
            await userSchema.findByIdAndDelete(authUser.id);

            return res.status(200).json({message: "User deleted successfully"});
        } catch (error) {
            console.error(error);
            return res.status(500).json({error: "Server error"});
        }
    },
    favorite: async (req, res) => {
        const {authUser} = req.body;
        const {postId} = req.params;
        const authUserData = await userSchema.findById(authUser.id);
        const index = authUserData.favorites.indexOf(postId);
        if (index !== -1) {
            authUserData.favorites.splice(index, 1);
            await authUserData.save();
            const user = await userSchema.findById(authUser.id);
            return res.status(200).json({message: "post removed from favorites", user: user});
        } else {
            authUserData.favorites.push(postId);
            await authUserData.save();
            const user = await userSchema.findById(authUser.id).select('-password');
            return res.status(200).json({message: "Post added to favorites", user: user});
        }
    },
    profile: async (req, res) => {
        const username = req.params.username;
        const findUser = await userSchema.findOne({username: username}, {password: 0});
        res.status(200).json({message: "ok", user: findUser});
    }
}
