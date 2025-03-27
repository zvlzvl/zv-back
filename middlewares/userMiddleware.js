const userSchema = require("../schemas/userSchema");
const bcrypt = require("bcrypt");
module.exports = {

    validateLogin: (req, res, next) => {
        const {password} = req.body;
        const username = req.body.username.trim();
        const minUsernameLength = 4;
        const maxUsernameLength = 20;
        const minPasswordLength = 4;
        const maxPasswordLength = 20;

        if (!username || username === "") {
            return res.status(400).json({error: "Username required"});
        } else if (username.length < minUsernameLength || username.length > maxUsernameLength) {
            return res.status(400).json({error: "username length should be between " + minUsernameLength + "and " + maxUsernameLength});
        }
        if(!password || password === "") {
            return res.status(400).json({error: "Password required"});
        } else if (password.length < minPasswordLength || password.length > maxPasswordLength) {
            return res.status(400).json({error: "Password length should be between " + minPasswordLength + "and " + maxPasswordLength});
        }

        next();
    },
    validateRegister: (req, res, next) => {
        const {password, password2} = req.body;
        const username = req.body.username.trim();

        const minUsernameLength = 4;
        const maxUsernameLength = 20;
        const minPasswordLength = 4;
        const maxPasswordLength = 20;

        if (username === "" || !username) {
            return res.status(400).json({error: "Username required"})
        } else if (username.length < minUsernameLength) {
            return res.status(400).json({error: "Username length is too short"})
        } else if (username.length > maxUsernameLength) {
            return res.status(400).json({error: "Username length is too long"})
        }

        if (!password || !password2 || password==="" ) {
            console.log(password2)
            return res.status(400).json({error: "Password required"})
        } else if (password !== password2) {
            return res.status(400).json({error: "Passwords do not match!"})
        } else if (password.length < minPasswordLength || password.length > maxPasswordLength) {
            return res.status(400).json({error: "Password length should be between 4 and 20 characters!"})
        }

        next();
    },
    validateChangePassword: async (req, res, next) => {
        const {authUser, oldPassword, newPassword, new2Password,} = req.body;
        const minPasswordLength = 4;
        const maxPasswordLength = 20;

        // Find user
        const findUser = await userSchema.findById(authUser.id);
        if (!findUser) return res.status(404).send({error: "User not found"});

        // Check password
        const isPasswordValid = await bcrypt.compare(oldPassword, findUser.password);
        if (!isPasswordValid) return res.status(401).send({error: "Invalid credentials"});

        if (!newPassword || !new2Password || newPassword ==="" ) {
            return res.status(400).json({error: "Password required"})
        } else if (newPassword !== new2Password) {
            return res.status(400).json({error: "Passwords do not match!"})
        } else if (newPassword.length < minPasswordLength || newPassword.length > maxPasswordLength) {
            return res.status(400).json({error: "Password length should be between 4 and 20 characters!"})
        }

        next();
    },
}