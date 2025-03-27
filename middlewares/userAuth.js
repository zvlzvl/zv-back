const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const userToken = req.headers.authorization
    jwt.verify(userToken, process.env.SECRET_KEY, async (err, item) => {
        if(!item) return res.status(401).json({error: "Invalid token"});
        req.body.authUser = item;
        next();
    })
}