const  {Jwt_Secret}  = require("../utils/Keys.js");
const USER = require("../models/userModel.js");
const jwt = require("jsonwebtoken");

const isLoggedIn = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "You Must have logged In" });
    }
    const token = authorization.replace("Bearer ","")
    try {
        const payload = jwt.verify(token, Jwt_Secret);

        const { userId } = payload;
        const user = await USER.findById(userId);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "You Must have logged In" });
    }

}

module.exports =  isLoggedIn ;