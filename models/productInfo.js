const mongoose = require("mongoose");

const productInfo = new mongoose.Schema({
  "Customer ID": { type: String, required: true },
  "Product ID": { type: String, required: true },
  "Request Date": { type: Date, required: true },
  "Product Category": { type: String, required: true },
  "Asset ID": { type: String, required: true },
  "Asset Make": { type: String, required: true },
  "Asset Model": { type: String, required: true },
  "Preffered Payment Details": { type: Object, required: true },
  "Purchase Value": { type: Number, required: true },
  "Sale Value": { type: Number, required: true },
  Interest: { type: Number, required: true },
  Tenure: { type: Number, required: true },
  "Tenure Unit": { type: String, required: true },
  "Repayment Frequency": { type: String, required: true },
  "Repayment Day of Week": { type: Number, required: true },
  "Number of Installments": { type: Number, required: true },
  "Installment Amount": { type: Number, required: true },
  "Collateral Market Value": { type: Number, required: true },
  "Collateral Category": { type: String, required: true },
  "Request Status": { type: String, required: true },
  "Product Status": { type: String, required: true },
  "Approval Date": { type: String, required: true },
  "Date of Last Change": { type: String, required: true },
  Balance: { type: Number, required: true },
});

module.exports = mongoose.model("ProductData", productInfo);

// delete this after test is successful
// const productSchema = new mongoose.Schema({
//   "Product Type": { type: String, required: true },
//   "Product ID": { type: String, required: true },
//   "Customer ID": { type: String, required: true },
//   "Customer Name": { type: String, required: true },
//   "Date Issued": { type: Date, required: true },
//   "Description": { type: String, required: true },
//   "Reference": { type: String, required: true },
//   "Currency": { type: String, required: true },
//   "Book Value": { type: Number, required: true },
//   "Market Value": { type: Number, required: true },
//   "Return": { type: Number, required: true },
//   "Tenure": { type: Number, required: true },
//   "Weekly Installments": { type: Number, required: true },
// });
