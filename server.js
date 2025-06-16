const express = require("express");
const mongoose = require("mongoose");

const app = express();

const rootRouter = require("./routes/index")
const {mongoURL} = require("./config")

app.use(express.json());
app.use("/api/v1",rootRouter);

async function main(){

    await mongoose.connect("")
    
}

app.listen(3000);
console.log("listening to the port 3000");
