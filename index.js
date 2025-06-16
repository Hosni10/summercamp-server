// This is your test secret API key.

const express = require("express");
require("dotenv").config();

const cors = require("cors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());
// app.use(express.static("public"));

const YOUR_DOMAIN = "http://localhost:5000";

app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, price_1234) of the product you want to sell
        price: "{{PRICE_ID}}",
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });

  res.redirect(303, session.url);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(5000, () => console.log("Running on port 5000"));