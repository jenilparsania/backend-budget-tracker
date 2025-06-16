const express = require('express');
const { TransactionModel, UserModel } = require("../models/Transaction");
const router = express.Router();
const { authMiddleware } = require("../middleware");

// Create a new transaction
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { type, amount, category, description, isRecurring } = req.body;
        const userId = req.userId;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const transaction = new TransactionModel({
            userId,
            type,
            amount,
            category,
            description,
            isRecurring
        });

        // Update user balance
        user.balance += type === 'income' ? amount : -amount;
        await user.save();
        await transaction.save();

        res.status(201).json({
            message: "Transaction created successfully",
            transaction
        });
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all transactions for a user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const transactions = await TransactionModel.find({ userId });
        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update a transaction
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const update = req.body;

        const transaction = await TransactionModel.findOne({ _id: id, userId });
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Update user balance if amount or type changed
        if (update.amount || update.type) {
            const user = await UserModel.findById(userId);
            // Revert old transaction
            user.balance += transaction.type === 'income' ? -transaction.amount : transaction.amount;
            // Apply new transaction
            user.balance += update.type === 'income' ? update.amount : -update.amount;
            await user.save();
        }

        const updatedTransaction = await TransactionModel.findByIdAndUpdate(
            id,
            update,
            { new: true }
        );

        res.json({
            message: "Transaction updated successfully",
            transaction: updatedTransaction
        });
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete a transaction
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const transaction = await TransactionModel.findOne({ _id: id, userId });
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Update user balance
        const user = await UserModel.findById(userId);
        user.balance += transaction.type === 'income' ? -transaction.amount : transaction.amount;
        await user.save();

        await TransactionModel.findByIdAndDelete(id);

        res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router; 