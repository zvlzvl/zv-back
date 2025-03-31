const messageSchema = require("../schemas/messageSchema");
const userSchema = require("../schemas/userSchema");

const io = require("../modules/socket")
const usersOnline = require("../modules/usersOnline");

async function getUsersChatOpponents(userId) {
    const allMessages = await messageSchema.find({
        $or: [
            {getter: userId},
            {sender: userId}
        ]
    }).populate("sender", "username image").populate("getter", "username image");

    const users = new Map();

    allMessages.forEach(message => {
        if (message.sender._id.toString() !== userId) {
            users.set(message.sender._id.toString(), message.sender);
        }
        if (message.getter._id.toString() !== userId) {
            users.set(message.getter._id.toString(), message.getter);
        }
    });
    return Array.from(users.values());
}

module.exports = {
    getConversationUsers: async (req, res) => {
        const {authUser} = req.body;
        const users = await getUsersChatOpponents(authUser.id)

        if (!users) {
            return res.status(401).send({error: "No messages found"});
        }
        return res.status(200).json({chatUsers: users});
    },

    getUserMessages: async (req, res) => {
        const {authUser} = req.body;
        const {opponent} = req.params;

        const conversation = await messageSchema.find({
            $or: [
                {sender: opponent, getter: authUser.id},
                {sender: authUser.id, getter: opponent}
            ]
        }).populate("sender", "username image").populate("getter", "username image");

        if (!conversation) {
            return res.status(401).send({error: "No messages found"});
        }
        return res.status(200).json(conversation);
    },

    addMessage: async (req, res) => {
        const {authUser} = req.body;
        const {getter, sender, message} = req.body;

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
        //sukuriam nauja
        const newMessage = new messageSchema({
            sender,
            getter,
            message
        })
        await newMessage.save();

        // atnaujinam usersius abiems
        const myUsers = await getUsersChatOpponents(authUser.id);


        const userExist = usersOnline.userIsOnline(getter);

        const userConversation = await messageSchema.find({
            $or: [
                {sender: sender, getter: getter},
                {sender: getter, getter: sender}
            ]
        }).populate("sender", "username image").populate("getter", "username image");

        if (userExist) {
            const opponentUsers = await getUsersChatOpponents(getter);
            const currentUser = usersOnline.getUser(getter);
            io.to(currentUser.socketId).emit("chatUsers", {chatUsers: opponentUsers});
            io.to(currentUser.socketId).emit("conversation", {conversation: userConversation, sender:authUser.id});
        }
        return res.status(200).json({chatUsers: myUsers, conversation: userConversation});
    },

    delete: async (req, res) => {
        const {authUser} = req.body;
        const {messageId} = req.params;

        const getMessage = await messageSchema.findById({"_id": messageId}).populate("sender", "_id username image").populate("getter", " _id username image");
        const opponentId = getMessage.sender._id.toString() === authUser.id ? getMessage.getter._id.toString() : getMessage.sender._id.toString();

        await messageSchema.findByIdAndDelete(messageId);
        // atnaujinam usersius abiems
        const myUsers = await getUsersChatOpponents(authUser.id);

        const userExist = usersOnline.userIsOnline(opponentId);
        const userConversation = await messageSchema.find({
            $or: [
                {sender: authUser.id, getter: opponentId},
                {sender: opponentId, getter: authUser.id}
            ]
        }).populate("sender", "username image").populate("getter", "username image");


        if (userExist) {
            const opponentUsers = await getUsersChatOpponents(opponentId);
            const currentUser = usersOnline.getUser(opponentId);
            io.to(currentUser.socketId).emit("chatUsers", {chatUsers: opponentUsers});
            io.to(currentUser.socketId).emit("deleteMessage", {conversation: userConversation, sender:authUser.id});
        }
        return res.status(200).json({chatUsers: myUsers, conversation: userConversation});
    },
}
