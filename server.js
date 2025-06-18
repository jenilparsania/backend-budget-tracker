const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const rootRouter = require("./routes/index");
const { mongoURL } = require("./config/config");

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
}));
app.use(express.json());

// Routes
app.use("/", rootRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

async function main() {
    try {
        await mongoose.connect(mongoURL);
        console.log("Successfully connected to MongoDB");
        
        app.listen(3000, () => {
            console.log("Server is listening on port 3000");
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}

main();

// update request to update the transaction is still remaining

