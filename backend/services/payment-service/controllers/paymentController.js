const Stripe = require("stripe");
const Payment = require("../models/Payment");

exports.createPayment = async (req, res) => {
  try {
    const { userId, appointmentId, amount, currency, title } = req.body;

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
          }, quantity: 1,
        },],
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

    if (payment) {
      payment.status = "paid";
      await payment.save();

      res.json({ message: "Payment marked as PAID" });
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
      totalRevenue,
      totalTransactions: payments.length,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

