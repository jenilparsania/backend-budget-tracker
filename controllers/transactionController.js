const { TransactionModel, UserModel } = require("../models/Transaction");

// Create a new transaction
const createTransaction = async (req, res) => {
    try {
        const { type, amount, category, description, isRecurring } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!type || !amount || !category || !description) {
            return res.status(400).json({ 
                message: "Missing required fields: type, amount, category, description" 
            });
        }

        // Validate amount
        if (amount <= 0) {
            return res.status(400).json({ 
                message: "Amount must be greater than 0" 
            });
        }

        // Validate type
        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ 
                message: "Type must be either 'income' or 'expense'" 
            });
        }

        // Validate category
        const validCategories = ['salary', 'food', 'transport', 'entertainment', 'utilities', 'other'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ 
                message: "Invalid category. Must be one of: " + validCategories.join(', ') 
            });
        }

        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create transaction
        const transaction = new TransactionModel({
            userId,
            type,
            amount,
            category,
            description,
            isRecurring: isRecurring || false
        });

        // Update user balance
        const balanceChange = type === 'income' ? amount : -amount;
        user.balance += balanceChange;
        
        // Save both transaction and updated user
        await Promise.all([transaction.save(), user.save()]);

        res.status(201).json({
            message: "Transaction created successfully",
            transaction,
            newBalance: user.balance
        });
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all transactions for a user
const getTransactions = async (req, res) => {
    try {
        const userId = req.userId;
        const { 
            type, 
            category, 
            startDate, 
            endDate, 
            page = 1, 
            limit = 10,
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = { userId };
        
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query with pagination
        const transactions = await TransactionModel.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await TransactionModel.countDocuments(filter);

        res.json({
            transactions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalTransactions: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const transaction = await TransactionModel.findOne({ _id: id, userId });
        
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json(transaction);
    } catch (error) {
        console.error("Error fetching transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update a transaction
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const update = req.body;

        // Validate update fields
        if (update.amount && update.amount <= 0) {
            return res.status(400).json({ 
                message: "Amount must be greater than 0" 
            });
        }

        if (update.type && !['income', 'expense'].includes(update.type)) {
            return res.status(400).json({ 
                message: "Type must be either 'income' or 'expense'" 
            });
        }

        if (update.category) {
            const validCategories = ['salary', 'food', 'transport', 'entertainment', 'utilities', 'other'];
            if (!validCategories.includes(update.category)) {
                return res.status(400).json({ 
                    message: "Invalid category. Must be one of: " + validCategories.join(', ') 
                });
            }
        }

        // Find existing transaction
        const transaction = await TransactionModel.findOne({ _id: id, userId });
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Update user balance if amount or type changed
        if (update.amount !== undefined || update.type !== undefined) {
            const user = await UserModel.findById(userId);
            
            // Revert old transaction impact
            const oldBalanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
            user.balance += oldBalanceChange;
            
            // Apply new transaction impact
            const newAmount = update.amount !== undefined ? update.amount : transaction.amount;
            const newType = update.type !== undefined ? update.type : transaction.type;
            const newBalanceChange = newType === 'income' ? newAmount : -newAmount;
            user.balance += newBalanceChange;
            
            await user.save();
        }

        // Update transaction
        const updatedTransaction = await TransactionModel.findByIdAndUpdate(
            id,
            update,
            { new: true, runValidators: true }
        );

        res.json({
            message: "Transaction updated successfully",
            transaction: updatedTransaction
        });
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const transaction = await TransactionModel.findOne({ _id: id, userId });
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Update user balance
        const user = await UserModel.findById(userId);
        const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
        user.balance += balanceChange;
        
        // Delete transaction and update user
        await Promise.all([
            TransactionModel.findByIdAndDelete(id),
            user.save()
        ]);

        res.json({ 
            message: "Transaction deleted successfully",
            newBalance: user.balance
        });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get transaction statistics
const getTransactionStats = async (req, res) => {
    try {
        const userId = req.userId;
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            if (startDate) dateFilter.$gte = new Date(startDate);
            if (endDate) dateFilter.$lte = new Date(endDate);
        }

        const filter = { userId };
        if (Object.keys(dateFilter).length > 0) {
            filter.date = dateFilter;
        }

        // Get total income and expenses
        const incomeResult = await TransactionModel.aggregate([
            { $match: { ...filter, type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const expenseResult = await TransactionModel.aggregate([
            { $match: { ...filter, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Get category breakdown
        const categoryBreakdown = await TransactionModel.aggregate([
            { $match: filter },
            { $group: { 
                _id: '$category', 
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }},
            { $sort: { total: -1 } }
        ]);

        const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
        const totalExpenses = expenseResult.length > 0 ? expenseResult[0].total : 0;
        const netBalance = totalIncome - totalExpenses;

        res.json({
            totalIncome,
            totalExpenses,
            netBalance,
            categoryBreakdown,
            period: {
                startDate: startDate || null,
                endDate: endDate || null
            }
        });
    } catch (error) {
        console.error("Error fetching transaction stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionStats
}; 