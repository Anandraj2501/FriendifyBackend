const express = require("express");
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedin");
const POST = require("../models/posts")

router.post("/comment",isLoggedin,async(req,res)=>{
    const {postId} = req.body;
    const {comment} = req.body;
    const _id = req.user._id;
    console.log(postId,comment,_id)

    if(!postId){
        return res.status(400).json({error:"PostId not provided"});
    }
    const post = await POST.findById(postId);
    if(!post){
        return res.status(400).json({error:"Post Not found"});
    }

    try{
        post.comments.push({ text: comment, user: _id,time:Date.now() });
        
        await post.save();

        return res.status(200).json({message:"Successfully Commented"});
    }catch(error){
        return res.status(500).json({error:error.message});
    }
})

router.post("/reply",isLoggedin,async(req,res)=>{
    const {postId,commentId,replyText} = req.body;
    const _id = req.user._id; 

    if (!postId || !commentId || !replyText) {
        return res.status(400).json({ error: "postId, commentId, or replyText not provided" });
    }

    const post = await POST.findById(postId);
    if(!post){
        return res.status(400).json({error:"Post Not found"});
    }

    try{
        const comment = post.comments.id(commentId);
        if(!comment){
            return res.status(400).json({error:"Comment not found"});
        }
        comment.replies.push({text:replyText,user:_id,time:Date.now()});

        await post.save();
        return res.status(200).json({message:"Success"});
    }catch(error){
        return res.statusMessage(500).json({error:error.message});
    }


})

module.exports = router;