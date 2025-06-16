const express = require("express");
const cors = require("cors");
const userRouter = require("./user");
const accountRouter = require("./account");
const transactionRouter = require("./transaction");
const router = express.Router();

// Apply CORS middleware to the router
router.use(cors());

// Mount the routes
router.use("/user", userRouter);
router.use("/account", accountRouter);
router.use("/transaction", transactionRouter);

module.exports = router;

