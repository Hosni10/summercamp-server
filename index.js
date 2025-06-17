// This is your test secret API key.

const express = require("express");
require("dotenv").config();

const cors = require("cors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());
app.use(cors());

const YOUR_DOMAIN = "http://localhost:5173"; // Update to your frontend URL

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "aed" } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
