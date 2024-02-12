const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");


mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;

db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to DB"));
app.use(express.json());
const apiRouter = require("./routes/api");

// setting an open cors policy
app.use(cors());
app.options('*', cors());

app.use("/api", apiRouter);


// app.listen(8443, () => console.log("Server is running on port 8443"));

module.exports = app;