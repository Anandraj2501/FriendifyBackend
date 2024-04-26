const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const {mongoURl} = require("./utils/Keys.js");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");


mongoose.connect(mongoURl);
mongoose.connection.on("connected",()=>{
    console.log("Database connected");
})
mongoose.connection.on("error",()=>{
    console.log("Database not connected");
})
app.use(cors());

app.use(express.json())
app.use(require("./routes/auth"));
// app.use(upload.none());
const storage = multer.memoryStorage();
const upload = multer({ storage });
app.use(require("./routes/createpost.js"));

app.use(require("./routes/like_unlike.js"));
app.use(require("./routes/comment.js"));
app.use(require("./routes/userProfile.js"));
app.use(require("./routes/searchUsers.js"));

  

app.listen(PORT,(req,res)=>{
    console.log("server running on "+PORT);
})