const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  "Product Type": { type: String, required: true },
  "Product ID": { type: String, required: true },
  "Customer ID": { type: String, required: true },
  "Customer Name": { type: String, required: true },
  "Date Issued": { type: Date, required: true },
  "Description": { type: String, required: true },
  "Reference": { type: String, required: true },
  "Currency": { type: String, required: true },
  "Book Value": { type: Number, required: true },
  "Market Value": { type: Number, required: true },
  "Return": { type: Number, required: true },
  "Tenure": { type: Number, required: true },
  "Weekly Installments": { type: Number, required: true },
});

module.exports = mongoose.model("ProductData", productSchema);