const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const isLoggedIn = require("../middlewares/isLoggedin");
const POST = require("../models/posts");
const cloudinary = require('cloudinary').v2;
const { cloudinary_api_key } = require("../utils/Keys.js");
const { cloudinary_api_secret } = require("../utils/Keys.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const cron = require('node-cron');


const storage = multer.memoryStorage();
const upload = multer({ storage });

cloudinary.config({
    cloud_name: 'delt5c1ap',
    api_key: cloudinary_api_key,
    api_secret: cloudinary_api_secret
});


router.post("/createPost", isLoggedIn, upload.single('image'), async (req, res) => {
    const { title,scheduledTime } = req.body;
    const image = req.file;


    try {
        if (!title || !image) {
            return res.status(422).json({ error: "Please Provide all details" });
        }

        let imageURL;
        const tempFilePath = path.join(__dirname, "../utils/temp", image.originalname);
        await fs.writeFile(tempFilePath, image.buffer);

        const imageResult = await cloudinary.uploader.upload(tempFilePath, { folder: "posts", resource_type: "image" });

        await fs.unlink(tempFilePath);


        if (!imageResult || !imageResult.secure_url) {
            return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
        }

        imageURL = imageResult.secure_url;
        console.log(imageURL);

        const postTime = scheduledTime ? new Date(scheduledTime).getTime() : Date.now();
        const newPost = new POST({
            title,
            image: imageURL, // Set the image URL obtained from Cloudinary
            postTime,
            scheduledTime: scheduledTime ? new Date(scheduledTime).getTime() : null,
            postedBy: req.user
        });

        const savedPost = await newPost.save();
        if (!savedPost) {
            return res.status(500).json({ error: "Failed to save post to the database" });
        }
        console.log(savedPost);
        return res.status(200).json({ message: "Created" });

    } catch (error) {
        console.log("error is", error)
        res.status(500).json({ error: "Internal server error cpost" });
    }
})


cron.schedule('* * * * *', async () => {
    try {
        const currentTime = Date.now();

        // Find all scheduled posts whose scheduledTime has passed
        const scheduledPosts = await POST.find({ scheduledTime: { $lte: currentTime } });

        // Publish each scheduled post
        for (const post of scheduledPosts) {
            post.postTime = currentTime; // Update postTime to current time
            post.scheduledTime = null; // Clear scheduledTime
            await post.save();
            console.log(`Published scheduled post: ${post._id}`);
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

router.get("/allposts", isLoggedIn, async (req, res) => {
    const page = req.query.pages ? parseInt(req.query.pages) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;

    try {
        const currentTime = Date.now();

        // Find posts where either scheduledTime is null or scheduledTime is in the past
        const data = await POST.find({
            $or: [
                { scheduledTime: null },
                { scheduledTime: { $lte: currentTime } }
            ]
        })
        .populate('postedBy', '-password -email')
        .sort({ postTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

        if (data.length === 0) {
            return res.status(404).json({ error: "Data not available" });
        }

        const count = await POST.countDocuments({
            $or: [
                { scheduledTime: null },
                { scheduledTime: { $lte: currentTime } }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        return res.status(200).json({
            message: "Data",
            currentPage: page,
            totalPages: totalPages,
            data: data
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Internal Server error" });
    }
});
router.get("/scheduledpost", isLoggedIn, async (req, res) => {
    const userId = req.user._id;
    try {
        const currentTime = Date.now();


        const data = await POST.find({
            $and: [
                { $or: [{ scheduledTime: { $ne: null } }, { scheduledTime: { $gt: currentTime } }] },
                { postedBy: userId } // Only show posts scheduled by the current user
            ]
        }).populate('postedBy', '-password -email');
       

        if (data.length === 0) {
            return res.json({ data:[] });
        }


        return res.status(200).json({
            
            data: data
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Internal Server error" });
    }
});

router.delete("/deleteSchedulePost/:postId",isLoggedIn,async(req,res)=>{
    const postId = req.params.postId;
    console.log(postId);
    if(!postId){
        return res.status(404).json({error:"Post ID Not Provided"});
    }
    try {
        // Find the post by postId
        const post = await POST.findById(postId);

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if the scheduledTime is null
        if (post.scheduledTime === null) {
            return res.status(400).json({ error: "Cannot delete scheduled post,already posted" });
        }

        // Delete the post
        await POST.deleteOne({ _id: postId });

        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
})

module.exports = router;