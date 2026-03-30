const express = require("express");
const router = express.Router();

const {
  createPayment,
  getAllPayments,
  markAsPaid,
  refundPayment,
  getFinancialSummary
} = require("../controllers/paymentController");

router.post("/create", createPayment);
router.get("/", getAllPayments);
router.put("/success/:sessionId", markAsPaid);
router.put("/refund/:id", refundPayment);
router.get("/summary", getFinancialSummary);

module.exports = router;
