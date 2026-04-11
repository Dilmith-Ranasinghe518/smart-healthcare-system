const express = require("express");
const router = express.Router();

const {
  createPayment,
  getAllPayments,
  markAsPaid,
  refundPayment,
  getFinancialSummary,
  getTaxSetting,
  updateTaxSetting,
  doctorCancelPayment
} = require("../controllers/paymentController");

router.post("/create", createPayment);
router.get("/", getAllPayments);
router.put("/success/:sessionId", markAsPaid);
router.put("/refund/:id", refundPayment);
router.get("/summary", getFinancialSummary);
router.get("/tax-setting", getTaxSetting);
router.put("/tax-setting", updateTaxSetting);
router.put("/doctor-cancel/:appointmentId", doctorCancelPayment);

module.exports = router;
