const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedin");
const POST = require("../models/posts");
const USER = require("../models/userModel.js");
const cloudinary = require('cloudinary').v2;
const { cloudinary_api_key } = require("../utils/Keys.js");
const { cloudinary_api_secret } = require("../utils/Keys.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

router.get("/userProfile/:id", isLoggedIn, async (req, res) => {
    const userId = req.params.id;
    const currentTime = Date.now();
    try {
        const user = await USER.findById(userId).select('profilePic name');
        const data = await POST.find({
            $and: [
                { postedBy: userId },
                {
                    $or: [
                        { scheduledTime: null },
                        { scheduledTime: { $lte: currentTime } }
                    ]
                }
            ]
        })
        res.status(200).json({ data,user });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

const storage = multer.memoryStorage();
const upload = multer({ storage });

cloudinary.config({
    cloud_name: 'delt5c1ap',
    api_key: cloudinary_api_key,
    api_secret: cloudinary_api_secret
});

router.post("/changepic", isLoggedIn, upload.single('image'), async (req, res) => {
    const image = req.file;
    console.log(image);
    const id = req.user._id;
    console.log(id);

    try {
        if (!image) {
            return res.status(422).json({ error: "Please Provide image" });
        }

        let imageURL;
        const tempFilePath = path.join(__dirname, "../utils/temp", image.originalname);
        await fs.writeFile(tempFilePath, image.buffer);

        const imageResult = await cloudinary.uploader.upload(tempFilePath, { folder: "posts", resource_type: "image" });

        await fs.unlink(tempFilePath);


        if (!imageResult || !imageResult.secure_url) {
            return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
        }

        await USER.findByIdAndUpdate(id, { profilePic: imageResult.secure_url });

        res.status(200).json({ message: "Profile Pic Uploaded", data: imageResult.secure_url });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;