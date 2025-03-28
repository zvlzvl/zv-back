let users = []

module.exports = {
    addOnlineUser: (user) => {
        users.push(user)
        return users;
    },
    getOnlineUsers: () => {
        return users;
    },
    userIsOnline: (user_id) => {
        console.log("atejo" , user_id);
        console.log(users);
        const foundUser = users.find(x => x.userId === user_id);
        return !!foundUser;
    },
    getUser: (user_id) => {
        return users.find(x => x.userId === user_id);
    },
    removeOnlineUser: (socket_id) => {
        users = users.filter(x => x.socketId !== socket_id)
    },

}