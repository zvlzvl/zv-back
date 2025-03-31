const express = require('express');
const router = express.Router();

const userController = require("../controllers/userController.js");
const messageController = require("../controllers/messageController.js");
const postController = require("../controllers/postController.js");
const userAuth = require("../middlewares/userAuth.js");
const {
    validateLogin, validateRegister, validateChangePassword
} = require("../middlewares/userMiddleware.js");


router.get("/users", userController.getUsers);
router.get("/user/:userId", userController.getUser);
router.post("/login",validateLogin, userController.login);
router.post("/register",validateRegister, userController.register);
router.post("/update",userAuth, userController.update);
router.post("/change-password",userAuth, validateChangePassword, userController.changePassword);
router.get("/profile/:username", userController.profile);
router.post("/delete",userAuth, userController.delete);
router.get("/favorite/:postId",userAuth, userController.favorite);

router.get("/get-conversation-users",userAuth, messageController.getConversationUsers);
router.post("/send-message",userAuth, messageController.addMessage);
router.get("/delete-message/:messageId", userAuth, messageController.delete)
router.get("/messages/:opponent", userAuth, messageController.getUserMessages);

router.get("/posts", postController.getPosts);
router.get("/post/:postId", postController.getPost);

router.post("/add-post",userAuth, postController.create);
router.get("/posts/favorite",userAuth, postController.getFavorite);
router.post("/post/:postId/comment",userAuth, postController.addComment);


module.exports = router;