const mongoose = require("mongoose");

const customerInfo = new mongoose.Schema({
  "Customer ID": { type: String, required: true },
  "First Name": { type: String, required: true },
  "Last Name": { type: String, required: true },
  DOB: { type: String, required: true },
  Gender: { type: String, required: true },
  "Email Address": { type: String, required: true, unique: true },
  "Phone Number": { type: String, required: true, unique: true },
  "Registration Date": { type: String, required: true },
  "Home Address": { type: String, required: true },
  City: { type: String, required: true },
  Country: { type: String, required: true },
  "Payment Details": { type: Object, required: true },
  Password: { type: String, required: true },
  "Government ID Number": { type: String, required: true },
  Status: { type: String, required: false },
  Balance: { type: Number, required: false },
  Products: { type: Object, required: false },
  "Password Reset Token": {type: Object, required: false},
  "Last Transaction Date": { type: Date, required: false },
  "Last Transaction Due Date": { type: Date, required: false },
});

module.exports = mongoose.model("CustomerInfo", customerInfo);
