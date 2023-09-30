import cors from "cors";
import mongoose from "mongoose";
import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";

import multer from "multer";
const app = express();
import path from "path";
import fileUpload from "express-fileupload";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(
    session({
        secret: "6fbbfcdf6ff8939d88c9651ea311574996bdcf2d9e5fa7e6cabc20e7fccf6467",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, 
    })
);
app.use(cookieParser());
dotenv.config();
app.use(express.json());

app.use(express.static('images'))
app.use(fileUpload())

const MONGO_URL = "mongodb://127.0.0.1:27017/TravelSnap";

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("open", () => {
    console.log("Connected to MongoDB");
});

db.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});

  app.post("/api/upload", (req, res) => {

    const file = req.files.file;
            const title = req.body.title;
            const desc = req.body.desc;
            console.log(title,desc,file);
            const info = {
                title: title,
                path: `/${file.name}`,
                desc: desc
            }

            file.mv(`${__dirname}/images/${file.name}`, error =>{
                if(error){
                    console.log(error);
                    return res.status(500).send({msg: 'Failed to upload Image'})
                }
               
                return res.send({name: file.name, path: `/${file.name}`})
            })
  });

  const PostSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        unique: false,
      },
      content: {
        type: String,
        required: true,
      },
      photo: {
        type: String,
      },
      userName: {
        type: String,
        required: true,
      },
      categories: {
        type: Array,
        required: false,
        default: [],
      },
    },
    { timestamps: true }
  );
  const Post = mongoose.model("Post", PostSchema);

  //CREATE POST
  app.post("/posts", async (req, res) => {
    const newPost = new Post(req.body);
    console.log(req.body);
    try {
      const savedPost = await newPost.save();
      res.status(200).json(savedPost);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  app.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find()
        res.status(200).json(posts)
    } catch (error) {
        res.status(501).json(error.message || 'Something went wrong');
    }
  })

const userSchema = mongoose.Schema({
    userName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    pass: {
        type: String,
        required: true,
    },
});

const User = mongoose.model("User", userSchema);


app.use(express.json());


app.get("/", (req, res) => {
    res.send("Hello World")
})

// app.use(function (req, res, next) {
//     res.cookie("sessionId", Math.random().toString(36).substring(7), { expires: 3600 });
//     next();
// });


app.post("/api/register", async (req, res) => {
    const { userName, email, pass } = req.body;

    try {
        if (!userName || !email || !pass) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        const user = new User({ userName, email, pass });

        const createdUser = await user.save();

        return res.status(200).json(createdUser)
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: "Server Error" });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, pass } = req.body;
    console.log(req.body);
    if (!email || !pass) {
        return res.status(401).json({ msg: "All Fields Required..." });
    }

    try {
        const user = await User.findOne({ email });
        console.log(user);

        if (!user) {
            return res.status(401).json({ msg: "Please check username and password.." });
        }

        console.log(user)

        // const isPasswordValid = await bcrypt.compare(pass, user.pass);

        /**
         * Temp
         * 
         */
        console.log(pass + "===" + user.pass)
        const isPasswordValid = pass === user.pass

        console.log(isPasswordValid)
        if (!isPasswordValid) {
            return res.status(401).json({ msg: "User not authorized. Login Failed." });
        }

        // Create a session and set a user cookie upon successful login
        req.session.user = user;

        // Set a secure, httpOnly, and sameSite cookie for user authentication
        res.cookie("user-token", "user-token", {
            httpOnly: true,
            secure: true, // Set to true in a production environment with HTTPS
            sameSite: "strict",
            maxAge: 3600000, // Cookie expiration time (1 hour in milliseconds)
        });

        return res.status(200).json({msg: "Login Successfully.", user})
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ msg: "Server Error" });
    }
});





app.listen(8908, () => {
    console.log("Server is running on port 8908");
});