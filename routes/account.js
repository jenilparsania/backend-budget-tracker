const express = require('express');
const { TransactionModel, UserModel } = require("../models/Transaction");
const router = express.Router();
const { authMiddleware } = require("../middleware")

router.get("/transactions", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await UserModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const transactions = await TransactionModel.find({ userId: userId });

        res.json({
            balance: user.balance,
            transactions: transactions
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;