const express = require('express');

const jwt = require("jsonwebtoken");

const {JWT_SECRET } = require("./config/config");

const authMiddleware = (req,res,next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(403).json({
            message : "Unable to connect ,please try again"
        });
    }

    const token = authHeader.split('')[1];

    try {
        const decoded = jwt.verify(token,JWT_SECRET);

        req.userId = decoded.userId;

        next();
    }catch (err){
        return res.status(411).json({});
    }
};

module.exports = {
    authMiddleware
}