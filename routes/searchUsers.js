const express = require("express");
const isLoggedIn = require("../middlewares/isLoggedin");
const router = express.Router();
const USERS = require("../models/userModel");

router.get("/searchusers", isLoggedIn, async (req, res) => {
    const {searchParam} = req.query;
    if(searchParam===""){
        return res.status(400).json({error:"enter Text"})
    }
    try {
        const users = await USERS.find({
            $or: [
                { name: { $regex: searchParam, $options: 'i' } },
                { email: { $regex: searchParam, $options: 'i' } }
            ]
        }, 'name _id profilePic')
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({error:error.message});
    }
})

module.exports = router;