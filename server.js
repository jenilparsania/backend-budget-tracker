const express = require("express");
const mongoose = require("mongoose");

const app = express();

const rootRouter = require("./routes/index");
const { mongoURL } = require("./config/config");

app.use(express.json());
app.use("/", rootRouter);

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
