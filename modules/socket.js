

const {Server} = require("socket.io");
let usersOnline = require("../modules/usersOnline")

const io = new Server({
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log("🔌 A user connected:", socket.id);

    socket.on("login", ({userId}) => {
        const userExist = usersOnline.userIsOnline(userId);

        if (!userExist) {
            const user = {
                userId: userId,
                socketId: socket.id,
            }
            usersOnline.addOnlineUser(user);
            console.log(usersOnline.getOnlineUsers(), "***")
        }
    });

    socket.on("disconnect", () => {
         usersOnline.removeOnlineUser(socket.id);
    });

    socket.on("restart", () => {
        usersOnline.removeOnlineUser(socket.id);
    });
});

module.exports = io;
