const Stripe = require("stripe");
const Payment = require("../models/Payment");
const axios = require("axios");

exports.createPayment = async (req, res) => {
  try {
    const { userId, appointmentId, amount, currency, title } = req.body;

    console.log("CREATE PAYMENT BODY:", req.body);
    console.log("Received appointmentId:", appointmentId);

    if (!appointmentId) {
      return res.status(400).json({ message: "appointmentId is required" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("FATAL: STRIPE_SECRET_KEY is missing from environment variables.");
    }

    // Initialize Stripe inside the handler to ensure env is ready
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const frontendUrl = process.env.FRONTEND_URL;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency || "usd",
            product_data: {
              name: title || "Doctor Consultation",
            },
            unit_amount: Math.round(amount), // Stripe expects integer cents
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
    });

    const payment = new Payment({
      userId,
      appointmentId,
      amount,
      status: "pending",
      stripeSessionId: session.id,
    });

    await payment.save();

    console.log("Saved payment document:", payment);

    res.json({ url: session.url });

  } catch (error) {
    console.error("Stripe/DB Error:", error);
    res.status(500).json({ message: "Payment error", error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      stripeSessionId: req.params.sessionId,
    });

    console.log("Found payment for success callback:", payment);

    if (payment) {
      payment.status = "paid";
      await payment.save();

      // Notify Appointment Service to activate the appointment
      try {
        await axios.patch(
          `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/${payment.appointmentId}/confirm-payment`,
          {},
          {
            headers: {
              "x-internal-service-secret": process.env.INTERNAL_SERVICE_SECRET
            }
          }
        );
      } catch (apptErr) {
        console.error("Failed to notify Appointment Service:");
        console.error("Message:", apptErr.message);
        console.error("Status:", apptErr.response?.status);
        console.error("Data:", apptErr.response?.data);
        console.error("Appointment ID:", payment.appointmentId);
        console.error("Appointment Service URL:", process.env.APPOINTMENT_SERVICE_URL);
      }

      res.json({ message: "Payment marked as PAID and appointment activated" });
    } else {
      res.status(404).json({ message: "Payment not found" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = "refunded";
    await payment.save();

    res.json({ message: "Payment refunded successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFinancialSummary = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "paid" });

    const totalRevenue = payments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    res.json({
      totalRevenue: totalRevenue / 100,
      totalTransactions: payments.length,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};