const express = require("express");
const isLoggedIn = require("../middlewares/isLoggedin");
const router = express.Router();
const POST = require("../models/posts");

router.put("/likepost",isLoggedIn,async (req,res)=>{
    const {postId} = req.body
    console.log(req.body);
    try{
        if(!postId){
            return res.status(400).json({error:"Post ID Required"});
        }
        const post = await POST.findById(postId);

        if(!post){
            return res.status(400).json({errro:"Post Not Found"});
        }

        const _id = req.user._id;

        if (post.likedBy.includes(_id)){
            return res.status(400).json({error:"Post Already Liked"});
        }

        post.likes += 1;
        post.likedBy.push(_id);
        await post.save();

        console.log("Post updated:", post);
        res.status(200).json({message:"unLiked"});

    }catch(error){
       return res.status(500).json({error:error})
    }
})

router.put("/unlikepost",isLoggedIn,async (req,res)=>{
    const {postId} = req.body
    console.log(postId);
    try{
        if(!postId){
            return res.status(400).json({error:"Post ID Required"});
        }
        const post = await POST.findById(postId);

        if(!post){
            return res.status(400).json({error:"Post Not Found"});
        }
        console.log(post);
        const _id = req.user._id;
        
        if (!post.likedBy.includes(_id)){
            return res.status(400).json({error:"Post not Liked"});
        }
        console.log(_id);

        const index = await post.likedBy.indexOf(_id);
        
        console.log(index);
        post.likes -= 1;
        post.likedBy.splice(index, 1);
        
        await post.save();
        res.status(200).json({message:"Liked"});
        console.log("Post updated:", post);
              

    }catch(error){
       return res.status(500).json({error:error})
    }
})
module.exports = router;