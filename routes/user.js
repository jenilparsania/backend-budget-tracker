const express = require('express');
const { JWT_SECRET } = require('../config/config');
const router = express.Router();
const jwt = require('jsonwebtoken');
const z = require('zod');
const bcrypt = require('bcrypt');
const { UserModel } = require("../models/Transaction");

const { authMiddleware } = require('../middleware');

const signupBody = z.object({
    username: z.string().email(),
    name: z.string(),
    password: z.string()
});

const signinBody = z.object({
    username: z.string().email(),
    password: z.string()
});

router.post("/signup", async function(req, res) {
    const { success, data } = signupBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        });
    }

    try {
        const existingUser = await UserModel.findOne({ username: data.username });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = new UserModel({
            username: data.username,
            password: hashedPassword,
            balance: 0
        });

        await newUser.save();
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);

        res.status(201).json({
            message: "User created successfully",
            token: token
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/signin", async function(req, res) {
    const { success, data } = signinBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        });
    }

    try {
        const user = await UserModel.findOne({ username: data.username });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);

        res.status(200).json({
            message: "Sign-in successful",
            token: token
        });
    } catch (error) {
        console.error("Error during signin:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;


