const mongoose = require("mongoose");

const interestRates = new mongoose.Schema({
  "3 months": { type: String, required: true },
  "6 months": { type: String, required: true },
  "9 months": { type: String, required: true },
  "12 months": { type: String, required: true },
  "15 months": { type: String, required: true },
  "18 months": { type: String, required: true },
  "21 months": { type: String, required: true },
  "24 months": { type: String, required: true },
  "27 months": { type: String, required: true },
  "30 months": { type: String, required: true },
  "33 months": { type: String, required: true },
  "36 months": { type: String, required: true },
});

module.exports = mongoose.model("InterestRates", interestRates);