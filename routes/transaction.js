const express = require('express');
const router = express.Router();
const { authMiddleware } = require("../middleware");
const {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionStats
} = require("../controllers/transactionController");

// Create a new transaction
router.post("/", authMiddleware, createTransaction);

// Get transaction statistics (must come before general route)
router.get("/stats/summary", authMiddleware, getTransactionStats);

// Get all transactions for a user (with filtering, pagination, sorting)
router.get("/", authMiddleware, getTransactions);

// Get transaction by ID
router.get("/:id", authMiddleware, getTransactionById);

// Update a transaction
router.put("/:id", authMiddleware, updateTransaction);

// Delete a transaction
router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router; 