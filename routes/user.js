const express = require('express');
const {JWT_SECRET} = require('../config');
const router = express.Router();
const jwt = require('jsonwebtoken');
const z = require('zod')
const {UserModel , EntityModel} = require("../models/Transaction");

const {authMiddleware} = require('../middleware');

const signupBody = z.object({
    username : z.string().email(),
    name : z.string(),
    password : z.string()
});


router.post("/signup",async function(req,res){
    const {success} = signupBody.safeParse(req.body);

    if(!success){
        return res.status(411).json({
            message : "incorrect inputs"
        });

    }

    
})


