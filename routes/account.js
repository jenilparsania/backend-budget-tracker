const express = require('express');
const { EntityModel, UserModel } = require("../models/Transaction");
const router = express.Router();
const { authMiddleware } = require("../middleware")

router.get("/transactions",authMiddleware, async (req,res)=>{

    const userId = req.userId;
    const account = await UserModel.findOne({
        userId : userId
    });

    res.json({
        balance : account.balance
    });
    
})