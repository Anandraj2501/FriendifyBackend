const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Jwt_Secret } = require("../utils/Keys.js");
const isLoggedIn = require("../middlewares/isLoggedin.js");


router.get("/", (req, res) => {
    res.json("hello world");
})
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;



router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(422).json({ error: "Please Provide all details" })
        }

        //validate email format
        if (!emailPattern.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Validate password format
        if (!passwordPattern.test(password)) {
            return res.status(400).json({ error: "Invalid password format" });
        }

        const existingUser = await USER.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "User already Exists" });
        }
        const newUSer = new USER({
            name,
            email,
            password: await bcrypt.hash(password, 12)
        })

        const savedUSer = await newUSer.save();
        res.status(201).json(savedUSer);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
})

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    console.log(email,password);

    if (!email || !password) {
        return res.status(400).json({ error: "Please provide all details" });
    }
    try {
        const user = await USER.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid Email" });
        }
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            return res.status(401).json({ error: "Invalid Password" });
        }
        const token = jwt.sign({userId:user._id},Jwt_Secret,{expiresIn:"7d"});
        return res.status(200).json({token, userId: user._id,profilePic: user.profilePic,userName:user.name });
    }catch(error){
        return res.status(500).json({error:"Internal Server error"});
    }
})
 

module.exports = router;