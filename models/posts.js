const mongoose = require("mongoose");
const USER = require("./userModel");

const PostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    video: {
        type: String,
        default: ""
    },
    postTime: {
        type: Number,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER"
    }],
    scheduledTime: {
        type: Number, // Store scheduled publish time
        default: null // Default to null if the post is not scheduled
    },
    comments: [{
        text: {
            type: String,
            default: ""
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "USER"
        },
        time: {
            type: Number,
            required: true
        },
        replies: [{
            text: {
                type: String,
                default: ""
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "USER"
            },
            time: {
                type: Number,
                required: true
            }
        }],
    }],

    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER"
    }
})

module.exports = mongoose.model("POST", PostSchema);