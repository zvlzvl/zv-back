const messageSchema = require("../schemas/messageSchema");
const userSchema = require("../schemas/userSchema");

const io = require("../modules/socket")
const usersOnline = require("../modules/usersOnline");
const {getOnlineUsers} = require("../modules/usersOnline");

module.exports = {
    getMessages: async (req, res) => {
        const {authUser} = req.body;
        const messages = await messageSchema
            .find({getter: authUser.id})
            .populate("sender", "username image")
            .sort({ created_at: -1 }); // Sort by created_at in descending order

        if (!messages) {
            return res.status(401).send({error: "No messages found"});
        }
        return res.status(200).json(messages);
    },
    addMessage: async (req, res) => {
        const { getter, sender, message} = req.body;

        if (!getter || !message || !sender || message.trim() === "") {
            return res.status(400).json({error: "Missing required fields"});
        } else if (message.legth > 200) {
            return res.status(400).json({error: "Message is to long"});
        }

        const senderUser = await userSchema.findById(sender);
        const getterUser = await userSchema.findById(getter);
        if (!senderUser || !getterUser) {
            return res.status(400).json({error: "Such user doesnt exist"});
        }

        const newMessage = new messageSchema({
            sender,
            getter,
            message
        })
        await newMessage.save();
        const messages = await messageSchema
            .find({getter: getter})
            .populate("sender", "username image")
            .sort({ created_at: -1 }); // Sort by created_at in descending order

        const userExist = usersOnline.userIsOnline(getter);

        if (userExist) {
            const currentUser = usersOnline.getUser(getter);
            io.to(currentUser.socketId).emit("message", {messages: messages, sender: senderUser});
        }
        return res.status(200).json({message: "ok"});
    },
    delete: async (req, res) => {
        const {authUser} = req.body;
        const {messageId} = req.params;

        await messageSchema.findByIdAndDelete(messageId);
        const messages = await messageSchema
            .find({getter: authUser.id})
            .populate("sender", "username image")
            .sort({ created_at: -1 }); // Sort by created_at in descending order
        return res.status(200).json({messages: messages});
    },

}
