const mongoose = require("mongoose");

const assetInfo = new mongoose.Schema({
  "Customer ID": { type: String, required: true },
  "Asset ID": { type: String, required: true },
  "Asset Model": { type: String, required: true },
  "Asset Make": { type: String, required: true },
  "Product ID": { type: String, required: true },
  "Asset Value": { type: Number, required: true },
  "Supplier Name": { type: String, required: true },
  "Supplier Address": { type: String, required: true },
  "Supplier Email": { type: String, required: true },
  "Supplier Number": { type: String, required: true },
});

module.exports = mongoose.model("AssetInfo", assetInfo);
