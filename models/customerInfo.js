const mongoose = require("mongoose");

const customerInfoSchema = new mongoose.Schema({
  "Customer ID": { type: String, required: true },
  "Full Name": { type: String, required: true },
  "Phone Number": { type: String, required: true },
  DOB: { type: Date, required: true },
  "Email Address": { type: String, required: true },
  "ID Type": { type: String, required: true },
  "ID Number": { type: String, required: true },
  "Home Coordinates": { type: String, required: true },
});

module.exports = mongoose.model("CustomerInfo", customerInfoSchema);