const mongoose = require("mongoose");

const transactionData = new mongoose.Schema({
  "Transaction ID": { type: String, required: true },
  "Customer ID": { type: String, required: true },
  "Product ID": { type: String, required: true },
  Amount: { type: Number, required: true },
  "Currency": { type: String, required: true },
  "Paystact Reference": { type: Object, required: true },
  Date: { type: String, required: true },
  "Balance Post Transaction": { type: Number, required: true },
});

module.exports = mongoose.model("TransactionData", transactionData);

// const transactionsSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   "Product ID": { type: String, required: true },
//   "Amount Received": { type: Number, required: true },
//   "Date Received": { type: Date, required: true },
//   "Days Late": { type: Number, required: true },
// });
