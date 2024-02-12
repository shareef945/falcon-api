require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;

db.on("error", (error) => console.error(error));
db.once("open", () => console.error("Connected to DB"));

app.use(express.json());

const apiRouter = require("./routes/api");
app.use(cors());
app.use("/api", apiRouter);
app.get("/", (res, req) => {
  res.json({ message: "Server is running" });
});

app.listen(3001, () => console.log("Server is running on port 3001"));
