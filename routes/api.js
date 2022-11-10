const express = require("express");
const router = express.Router();
const CustomerInfo = require("../models/customerInfo");
const TransactionData = require("../models/transactionData");
const ProductData = require("../models/productInfo");

//get all
router.get("/", async (req, res) => {
  try {
    const customerInfos = await CustomerInfo.find();
    res.send(customerInfos);
  } catch {
    res.status(500).json({ message: err.message });
  }
});

//create one
router.post("/", async (req, res) => {
  const customerInfo = new CustomerInfo({
    "Customer ID": req.body["Customer ID"],
    "Full Name": req.body["Full Name"],
    "Phone Number": req.body["Phone Number"],
    DOB: req.body.DOB,
    "Email Address": req.body["Email Address"],
    "ID Type": req.body["ID Type"],
    "ID Number": req.body["ID Number"],
    "Home Coordinates": req.body["Home Coordinates"],
  });
  try {
    const newCustomerInfo = await customerInfo.save();
    res.status(201).json(newCustomerInfo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//update one
router.patch("/:id", getCustomerInfo, async (req, res) => {
  if (req.body["Customer ID"] != null) {
    res.customerInfo["Customer ID"] = req.body["Customer ID"];
  }
  if (req.body["Full Name"] != null) {
    res.customerInfo["Full Name"] = req.body["Full Name"];
  }
  if (req.body["Phone Number"] != null) {
    res.customerInfo["Phone Number"] = req.body["Phone Number"];
  }
  if (req.body.DOB != null) {
    res.customerInfo.DOB = req.body.DOB;
  }
  if (req.body["Email Address"] != null) {
    res.customerInfo["Email Address"] = req.body["Email Address"];
  }
  if (req.body["ID Type"] != null) {
    res.customerInfo["ID Type"] = req.body["ID Type"];
  }
  if (req.body["ID Number"] != null) {
    res.customerInfo["ID Number"] = req.body["ID Number"];
  }
  if (req.body["Home Coordinates"] != null) {
    res.customerInfo["Home Coordinates"] = req.body["Home Coordinates"];
  }
  try {
    const updatedCustomerInfo = res.customerInfo.save();
    res.json(updatedCustomerInfo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//delete one
router.delete("/:id", (req, res) => {});

//get one
router.get("/:id", getCustomerInfo, (req, res) => {
  res.send(res.customerInfo);
});

//get statement
router.get("/transactions/:product", getTransactionInfo, (req, res) => {
  res.send(res.transactionInfo);
});

//get balance
router.get("/balance/:product", getTransactionInfo, (req, res) => {
  var total = 0;
  for (let i = 0; i < res.transactionInfo.length; i++) {
    total += res.transactionInfo[i]["Amount Received"];
  }
  res.send({"Total Paid:":total.toString()});
});

// router.get("/transactions", async (req, res) => {
//   try {
//     const TransactionDatas = await TransactionData.find();
//     res.send(TransactionDatas);
//   } catch {
//     res.status(500).json({ message: err.message });
//   }
// });

//get products
router.get("/customer/:id", getProductInfo, (req, res) => {
  res.send(res.productInfo);
});

async function getCustomerInfo(req, res, next) {
  let customerInfo;
  try {
    customerInfo = await CustomerInfo.findById(req.params.id);
    if (customerInfo == null) {
      return res.status(404).json({ message: "Cannot find productInfo" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.customerInfo = customerInfo;
  next();
}

async function getTransactionInfo(req, res, next) {
  let transactionInfo;
  try {
    transactionInfo = await TransactionData.find({
      "Product ID": { $all: [req.params.product] },
    });

    if (transactionInfo == null) {
      return res.status(404).json({ message: "Cannot find transactionInfo" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.transactionInfo = transactionInfo;
  next();
}

async function getProductInfo(req, res, next) {
  let productInfo;
  try {
    productInfo = await ProductData.find({
      "Customer ID": { $all: [req.params.id] },
    });

    if (productInfo == null) {
      return res.status(404).json({ message: "Cannot find productInfo" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.productInfo = productInfo;
  next();
}

module.exports = router;