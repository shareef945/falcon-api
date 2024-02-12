const CustomerInfo = require("../models/customerInfo");
const ProductData = require("../models/productInfo");
const { sendPaymentReminderEmail } = require("./mailjetFunctions");
const fetch = require("node-fetch");
let customers = [];

module.exports.hasTokenExpired = function (timestamp) {
    let date_1 = new Date(parseInt(timestamp));
    // current time
    let date_2 = new Date();
    // time in milliseconds
    let difference_in_milliseconds = date_2.getTime() - date_1.getTime();
    if (difference_in_milliseconds > 3600000) {
        return true;
    } else {
        return false;
    }
}

async function getCustomer() {
    return fetch(process.env.REACT_APP_API_URL + "customer", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(data => data.json()).catch(error => console.log(error))
}

async function sendEmaill(customer, repayment) {
    return fetch(process.env.REACT_APP_API_URL + "send-email", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            customer,
            repayment
        })
    }).then(data => data.json()).catch(error => console.log(error))
}

async function getCustomers() {
    // const response = await CustomerInfo.find();
    customers = await getCustomer();
}

async function getActiveProducts() {
    const products = await ProductData.find();
    await getCustomers();
    let activeProducts = [];
    if (products !== null) {
        products.forEach((product) => {
            if (product["Request Status"] == "Approved" && product["Product Status"] == "Active") {
                activeProducts.push(product);
            }
        });
    }
    // console.log(activeProducts);
    return activeProducts;
}

module.exports.findPaymentsDue = async function findPaymentsDue() {
    const activeProducts = await getActiveProducts();
    let paymentsDueCount = 0;
    let paymentsDue = [];
    activeProducts.forEach(async (product) => {
        if ((product?.["Repayment Day of Week"] == getTwoDaysWeekInt() && product?.["Repayment Frequency"] == "week") || (product?.["Repayment Day of Month"] == getTwoDaysMonthInt() && product?.["Repayment Frequency"] == "month")) {
            // work out paid
            let repayment = {
                productCategory: product["Product Category"],
                balance: '₵' + prettifyNumber(product["Balance"]),
                paid: '₵' + prettifyNumber((parseInt(product["Principal"]) + parseInt(product["Interest"])) - parseInt(product["Balance"])),
                totalAmount: '₵' + prettifyNumber(parseInt(product["Principal"]) + parseInt(product["Interest"])),
                repaymentDate: getRepaymentDate(),
                installmentAmount: '₵' + prettifyNumber(product["Installment Amount"])

            }
            // console.log("Customer ID:", product["Customer ID"]);

            // console.log(repayment);
            const customerr = customers?.find((e) => e["_id"] === product["Customer ID"]);;
            if (customerr) {
                const customer = {
                    "Email Address": customerr?.["Email Address"],
                    "First Name": customerr?.["First Name"]
                }
                // console.log("customer:", customer);
                if (customer?.["First Name"] != undefined) {
                    // console.log("ready to email: ", customer["Email Address"]);
                    paymentsDueCount = paymentsDueCount + 1;
                    paymentsDue.push({ customer, repayment });
                    await sendEmaill(customer, repayment);
                }
            }

        }
    });
    console.log(paymentsDueCount + " payments due in a few days");
    console.log(paymentsDue);
    return "success";
}

function getTwoDaysMonthInt() {
    // let d = new Date().getDate();
    // return d + 2;
    let date = new Date();
    date.setDate(date.getDate() + 3);
    return date.getDate();  
}

function getTwoDaysWeekInt() {
    let d = new Date().getDay();
    if (d < 4) {
        return d + 2;
    } else {
        // 5-5 is 0, 6-5 is 0, to get 5 + 2 days equals day 0, 6 + 2 days equals day 1
        return d - 5;
    }
}

function prettifyNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function getRepaymentDate() {
    // Get current date
    var date = new Date();
    // Add two days to current date
    date.setDate(date.getDate() + 4);
    return date.toDateString();
}