const mongoose = require("mongoose");

const transactionsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  "Product ID": { type: String, required: true },
  "Amount Received": { type: Number, required: true },
  "Date Received": { type: Date, required: true },
  "Days Late": { type: Number, required: true },
});

module.exports = mongoose.model("TransactionData", transactionsSchema);