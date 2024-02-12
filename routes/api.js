const express = require("express");
const router = express.Router();
const CustomerInfo = require("../models/customerInfo");
const TransactionData = require("../models/transactionData");
const ProductData = require("../models/productInfo");
const AssetInfo = require("../models/assetInfo");
const InterestRates = require("../models/interestRates");
const productInfo = require("../models/productInfo");
const { sendApprovalEmail } = require("../functions/mailjetFunctions");
const { sendLoanConfirmationEmail } = require("../functions/mailjetFunctions");
const { sendWelcomeEmail } = require("../functions/mailjetFunctions");
const { sendVerificationCode } = require("../functions/mailjetFunctions");
const bcrypt = require('bcryptjs');
const { sendPasswordResetEmail } = require("../functions/mailjetFunctions");
const { hasTokenExpired, findPaymentsDue } = require("../functions/usefulFunctions");
const Str = require('@supercharge/strings');
const { sendPaymentReminderEmail } = require("../functions/mailjetFunctions");
const { sendSMS } = require("../functions/twilioFunctions");

// send sms 
router.post('/send-sms', async (req, res) =>{
  try {
    await sendSMS(req.body);
    res.status(200);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
})

// send payments due email; this is called in findPaymentsDue()
router.post('/send-email', async (req, res) => {
  try {
    await sendPaymentReminderEmail(req.body.customer, req.body.repayment);
    // console.error(result);
    res.status(201).send({ "status": "ok" });
  } catch (err) {
    console.error(err);
    res.status(500);
  }

});

// find payments due; this is called in a cron job in the 24hr scheduler server
// it calls /send-email in each one due
router.get('/find-payments-due', async (req, res) => {
  try {
    await findPaymentsDue();
    // console.error(result);
    res.status(201).send({ "status": "ok" });
  } catch (err) {
    console.error(err);
    res.status(500);
  }

});

// avoiding duplicate sign ups manually
router.post('/avoid-duplicates', async (req, res) => {
  try {
    const customer = await CustomerInfo.findOne({
      "Email Address": req.body.email
    });
    if (customer == (undefined || null)) {
      res.status(201).send({ "exists": false });
    }
    else {
      res.status(201).send({ "exists": true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//sign in endpoint
router.post('/login', async (req, res) => {
  try {
    const customer = await CustomerInfo.findOne({
      "Phone Number": req.body["Phone Number"]
    });
    // match password, ideally more complicated than this direct password comparison because need to compare hashes?
    const comparison = await bcrypt.compare(req.body.password, customer.Password);
    if (comparison == true) {
      res.send(customer);
    } else {
      res.send({ message: "Incorrect password" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// verification request
router.post('/sendverification', async (req, res) => {
  try {
    sendVerificationCode(req.body);
    res.status(200);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// email for password reset request
router.post('/sendpasswordresetemail', async (req, res) => {
  try {
    let customer = await CustomerInfo.findOne({
      "Email Address": req.body.email
    });
    if (customer !== (undefined || null)) {
      await sendPasswordResetEmail(customer);
      res.send({ "message": "Sent" });
      console.error("New password reset email request for ", req.body.email);
    } else {
      res.send({ "message": "Sent" });
      console.error("Password reset request was discarded for an account that doesn't exist: ", req.body.email);
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ?CUSTOMER APIS

//get all customers
router.get("/customer", async (req, res) => {
  try {
    const customerInfos = await CustomerInfo.find();
    res.send(customerInfos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/resetpassword", async (req, res) => {
  try {
    let customer = await CustomerInfo.findOne({
      "Email Address": req.body.email
    });
    // check if token exists
    if (customer["Password Reset Token"].token == req.body.token) {
      //check if token has not expired
      if (!(hasTokenExpired(customer["Password Reset Token"].timestamp))) {
        // change password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        customer["Password"] = hash;
        const newCustomerInfo = await customer.save();
        res.status(201).json({ message: "Password changed." });
      } else {
        console.error("Password reset request was discarded because token has expired: ", req.body.email);
        res.status(201).json({ message: "Token has expired." });
      }
    } else {
      console.error("Password reset request was discarded because token received does not exist for: ", req.body.email);
      res.status(201).json({ message: "Operation was rejected." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//create customer
router.post("/customer", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.Password, salt);
  const customerInfo = new CustomerInfo({
    "Customer ID": req.body["Customer ID"],
    "First Name": req.body["First Name"],
    "Last Name": req.body["Last Name"],
    DOB: req.body["DOB"],
    Gender: req.body["Gender"],
    "Email Address": req.body["Email Address"],
    "Phone Number": req.body["Phone Number"],
    "Registration Date": req.body["Registration Date"],
    "Home Address": req.body["Home Address"],
    City: req.body["City"],
    Country: req.body["Country"],
    "Payment Details": req.body["Payment Details"],
    Password: hash,
    "Government ID Number": req.body["Government ID Number"],
    Status: req.body["Status"],
    Balance: req.body["Balance"],
    Products: req.body["Products"],
    "Last Transaction Date": req.body["Last Transaction Date"],
    "Last Transaction Due Date": req.body["Last Transaction Due Date"],
  });

  try {
    const newCustomerInfo = await customerInfo.save();
    sendWelcomeEmail(req.body);
    res.status(201).json(newCustomerInfo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//get one customer by id
router.get("/customer/:id", getCustomerInfo, (req, res) => {
  res.send(res.customerInfo);
});

//update one
router.patch("/customer/:id", getCustomerInfo, async (req, res) => {
  if (req.body["Customer ID"] != null) {
    res.customerInfo["Customer ID"] = req.body["Customer ID"];
  }
  if (req.body["First Name"] != null) {
    res.customerInfo["First Name"] = req.body["First Name"];
  }
  if (req.body["Last Name"] != null) {
    res.customerInfo["Last Name"] = req.body["Last Name"];
  }
  if (req.body["DOB"] != null) {
    res.customerInfo["DOB"] = req.body["DOB"];
  }
  if (req.body["Gender"] != null) {
    res.customerInfo["Gender"] = req.body["Gender"];
  }
  if (req.body["Email Address"] != null) {
    res.customerInfo["Email Address"] = req.body["Email Address"];
  }
  if (req.body["Phone Number"] != null) {
    res.customerInfo["Phone Number"] = req.body["Phone Number"];
  }
  if (req.body["Registration Date"] != null) {
    res.customerInfo["Registration Date"] = req.body["Registration Date"];
  }
  if (req.body["Home Address"] != null) {
    res.customerInfo["Home Address"] = req.body["Home Address"];
  }
  if (req.body["City"] != null) {
    res.customerInfo["City"] = req.body["City"];
  }
  if (req.body["Country"] != null) {
    res.customerInfo["Country"] = req.body["Country"];
  }
  if (req.body["Payment Details"] != null) {
    res.customerInfo["Payment Details"] = req.body["Payment Details"];
  }
  if (req.body["Password"] != null) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body["Password"], salt);
    res.customerInfo["Password"] = hash;
  }
  if (req.body["Government ID Number"] != null) {
    res.customerInfo["Government ID Number"] = req.body["Government ID Number"];
  }
  if (req.body["Status"] != null) {
    res.customerInfo["Status"] = req.body["Status"];
  }
  if (req.body["Balance"] != null) {
    res.customerInfo["Balance"] = req.body["Balance"];
  }
  if (req.body["Products"] != null) {
    res.customerInfo["Products"] = req.body["Products"];
  }
  if (req.body["Last Transaction Date"] != null) {
    res.customerInfo["Last Transaction Date"] =
      req.body["Last Transaction Date"];
  }
  if (req.body["Last Transaction Due Date"] != null) {
    res.customerInfo["Last Transaction Due Date"] =
      req.body["Last Transaction Due Date"];
  }
  try {
    const updatedCustomerInfo = res.customerInfo.save();
    res.json(updatedCustomerInfo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ?PRODUCT APIS

//get all products
router.get("/products", async (req, res) => {
  try {
    const productDatas = await ProductData.find();
    res.send(productDatas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//create product
router.post("/products", async (req, res) => {
  // const productInfo = new ProductData({
  //   "Customer ID": req.body["Customer ID"],
  //   "Product ID": req.body["Product ID"],
  //   "Request Date": req.body["Request Date"],
  //   "Product Category": req.body["Product Category"],
  //   "Asset ID": req.body["Asset ID"],
  //   "Asset Make": req.body["Asset Make"],
  //   "Asset Model": req.body["Asset Model"],
  //   "Preferred Payment Details": req.body["Preferred Payment Details"],
  //   "Purchase Value": req.body["Purchase Value"],
  //   "Sale Value": req.body["Sale Value"],
  //   Interest: req.body["Interest"],
  //   Tenure: req.body["Tenure"],
  //   Principal: req.body["Principal"],
  //   "Tenure Unit": req.body["Tenure Unit"],
  //   "Repayment Frequency": req.body["Repayment Frequency"],
  //   "Repayment Day of Week": req.body["Repayment Day of Week"],
  //   "Number of Installments": req.body["Number of Installments"],
  //   "Installment Amount": req.body["Installment Amount"],
  //   "Collateral Market Value": req.body["Collateral Market Value"],
  //   "Collateral Category": req.body["Collateral Category"],
  //   "Request Status": req.body["Request Status"],
  //   "Product Status": req.body["Product Status"],
  //   "Approval Date": req.body["Approval Date"],
  //   "Date of Last Change": req.body["Date of Last Change"],
  //   "Business Description": req.body["Business Description"],
  //   Balance: req.body["Balance"],
  // });
  const productInfo = new ProductData(req.body.product);
  try {
    const newProductData = await productInfo.save();
    sendLoanConfirmationEmail(req.body.product, req.body.email, req.body.name);
    res.status(201).json(newProductData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//get one product by product id
router.get("/products/:id", getProductData, (req, res) => {
  res.send(res.productData);
});

//get all products by customer id
router.get("/products/customer/:id", async (req, res) => {
  try {
    const productDatas = await ProductData.find({
      "Customer ID": req.params.id,
    });
    res.send(productDatas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



//update one
router.patch("/products/:id", getProductData, async (req, res) => {
  if (req.body["Customer ID"] != null) {
    res.productData["Customer ID"] = req.body["Customer ID"];
  }
  if (req.body["Product ID"] != null) {
    res.productData["Product ID"] = req.body["Product ID"];
  }
  if (req.body["Principal"] != null) {
    res.productData["Principal"] = req.body["Principal"];
  }
  if (req.body["Request Date"] != null) {
    res.productData["Request Date"] = req.body["Request Date"];
  }
  if (req.body["Product Category"] != null) {
    res.productData["Product Category"] = req.body["Product Category"];
  }
  if (req.body["Asset ID"] != null) {
    res.productData["Asset ID"] = req.body["Asset ID"];
  }
  if (req.body["Asset Make"] != null) {
    res.productData["Asset Make"] = req.body["Asset Make"];
  }
  if (req.body["Loan Sent"] != null) {
    res.productData["Loan Sent"] = req.body["Loan Sent"];
  }
  if (req.body["Active Date"] != null) {
    res.productData["Active Date"] = req.body["Active Date"];
  }
  if (req.body["Asset Model"] != null) {
    res.productData["Asset Model"] = req.body["Asset Model"];
  }
  if (req.body["Preferred Payment Details"] != null) {
    res.productData["Preferred Payment Details"] =
      req.body["Preferred Payment Details"];
  }
  if (req.body["Purchase Value"] != null) {
    res.productData["Purchase Value"] = req.body["Purchase Value"];
  }
  if (req.body["Sale Value"] != null) {
    res.productData["Sale Value"] = req.body["Sale Value"];
  }
  if (req.body["Interest"] != null) {
    res.productData["Interest"] = req.body["Interest"];
  }
  if (req.body["Tenure"] != null) {
    res.productData["Tenure"] = req.body["Tenure"];
  }
  if (req.body["Tenure Unit"] != null) {
    res.productData["Tenure Unit"] = req.body["Tenure Unit"];
  }
  if (req.body["Repayment Frequency"] != null) {
    res.productData["Repayment Frequency"] = req.body["Repayment Frequency"];
  }
  if (req.body["Repayment Day of Week"] != null) {
    res.productData["Repayment Day of Week"] =
      req.body["Repayment Day of Week"];
  }
  if (req.body["Repayment Day of Month"] != null) {
    res.productData["Repayment Day of Month"] =
      req.body["Repayment Day of Month"];
  }
  if (req.body["Number of Installments"] != null) {
    res.productData["Number of Installments"] =
      req.body["Number of Installments"];
  }
  if (req.body["Installment Amount"] != null) {
    res.productData["Installment Amount"] = req.body["Installment Amount"];
  }
  if (req.body["Collateral Market Value"] != null) {
    res.productData["Collateral Market Value"] =
      req.body["Collateral Market Value"];
  }
  if (req.body["Collateral Category"] != null) {
    res.productData["Collateral Category"] = req.body["Collateral Category"];
  }

  if (req.body["Request Status"] != null) {
    res.productData["Request Status"] = req.body["Request Status"];
  }
  if (req.body["Product Status"] != null) {
    res.productData["Product Status"] = req.body["Product Status"];
  }
  if (req.body["Approval Date"] != null) {
    res.productData["Approval Date"] = req.body["Approval Date"];
  }
  if (req.body["Date of Last Change"] != null) {
    res.productData["Date of Last Change"] = req.body["Date of Last Change"];
  }
  if (req.body["Balance"] != null) {
    res.productData["Balance"] = req.body["Balance"];
  }
  try {
    console.log(req.body)
    const updatedProductData = await res.productData.save();
    res.json(updatedProductData);
  } catch (err) {
    res.status(400).json({ message: err.message });
    console.log(err)
  }
});

// ?Transaction APIS

//get all transactions

router.get("/transactions", async (req, res) => {
  try {
    const transactionData = await TransactionData.find();
    res.send(transactionData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// create transaction

router.post("/transactions", async (req, res) => {
  const transactionData = new TransactionData({
    "Customer ID": req.body["Customer ID"],
    "Product ID": req.body["Product ID"],
    "Transaction ID": req.body["Transaction ID"],
    Amount: req.body["Amount"],
    Currency: req.body["Currency"],
    "Paystact Reference": req.body["Paystact Reference"],
    Date: req.body["Date"],
    "Balance Post Transaction": req.body["Balance Post Transaction"],
  });
  try {
    const newTransactionData = await transactionData.save();
    res.status(201).json(newTransactionData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//get transaction by product id

router.get(
  "/transactions/:product",
  getTransactionDataByProduct,
  (req, res) => {
    res.send(res.transactionInfo);
  }
);


// mailjet function to send an email when approved
router.post('/sendApprovalEmail', async (req, res) => {
  try {
    const result = await sendApprovalEmail(req.body);
    res.send(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// get one transactions

router.get("/transactions/id/:id", getTransactionDataById, (req, res) => {
  res.send(res.transactionInfo1);
});


// ?Interest Rates Api


router.get("/rates", async (req, res) => {
  try {
    const interestRate = await InterestRates.find();
    res.send(interestRate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/rates", async (req, res) => {
  const interestRate = new InterestRates({
    "3 months": req.body["3 months"],
    "6 months": req.body["6 months"],
    "9 months": req.body["9 months"],
    "12 months": req.body["12 months"],
    "15 months": req.body["15 months"],
    "18 months": req.body["18 months"],
    "21 months": req.body["21 months"],
    "24 months": req.body["24 months"],
    "27 months": req.body["27 months"],
    "30 months": req.body["30 months"],
    "33 months": req.body["33 months"],
    "36 months": req.body["36 months"],
  })
  try {
    const newInterestRate = await interestRate.save();
    res.status(201).json(newInterestRate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// *DONE WITH ABOVE

// !Pending asset APIs

// *GET BY ID FUNCTIONS

async function getCustomerInfo(req, res, next) {
  let customerInfo;
  try {
    customerInfo = await CustomerInfo.findById(req.params.id);
    if (customerInfo == null) {
      return res.status(404).json({ message: "Cannot find customer" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.customerInfo = customerInfo;
  next();
}


async function getTransactionDataByProduct(req, res, next) {
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

async function getTransactionDataById(req, res, next) {
  let transactionInfo1;
  try {
    transactionInfo1 = await TransactionData.find({
      "Transaction ID": { $all: [req.params.id] },
    });

    if (transactionInfo1 == null) {
      return res.status(404).json({ message: "Cannot find transactionInfo" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.transactionInfo1 = transactionInfo1;
  next();
}

async function getProductData(req, res, next) {
  let productData;
  try {
    productData = await ProductData.findById(req.params.id);
    // productData = await ProductData.findById({
    //   "_id": { $all: [req.params.id] },
    // });

    if (productData == null) {
      return res.status(404).json({ message: "Cannot find productInfo" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.productData = productData;
  next();
}

module.exports = router;