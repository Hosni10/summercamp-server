// This is your test secret API key.

const express = require("express");
require("dotenv").config();

const cors = require("cors");

const db = require("./database/dbConnection");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Parent = require("./database/model/parent.model");
const ConsentForm = require("./database/model/consentForm.model.js");
const sendEmail = require("./utils/sendEmail");
const getEmailTemplate = require("./utils/emailTemplate.js");
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://summercamp-client-67a8.vercel.app/",
      "http://localhost:5173",
      "https://summercamp-server.onrender.com",
    ],
    credentials: true,
  })
);

const YOUR_DOMAIN = "https://summercamp-client-67a8.vercel.app/"; // Update to your frontend URL

db();

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

app.post("/api/bookings", async (req, res) => {
  try {
    const bookingData = req.body;
    console.log("Received booking data:", bookingData);

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "parentEmail",
      "parentPhone",
      "parentAddress",
      "numberOfChildren",
      "children",
      "startDate",
      "plan",
      "pricing",
    ];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        console.error(`Missing required field: ${field}`);
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`,
          error: `Field ${field} is required`,
        });
      }
    }

    // Create a new parent booking record
    const newBooking = new Parent({
      firstName: bookingData.firstName,
      lastName: bookingData.lastName,
      parentEmail: bookingData.parentEmail,
      parentPhone: bookingData.parentPhone,
      parentAddress: bookingData.parentAddress,
      numberOfChildren: bookingData.numberOfChildren,
      children: bookingData.children,
      startDate: bookingData.startDate,
      membershipPlan: bookingData.plan.name,
      location: bookingData.location || "abuDhabi", // Default to Abu Dhabi
      totalAmountPaid: bookingData.pricing.finalTotal,
    });

    console.log("Attempting to save booking:", newBooking);

    // Save to database
    const savedBooking = await newBooking.save();

    console.log("Booking saved successfully:", savedBooking._id);

    // Send confirmation email
    try {
      console.log("Preparing to send confirmation email...");
      const emailHtml = getEmailTemplate({
        ...savedBooking.toObject(),
        bookingId: savedBooking._id.toString(),
      });

      console.log("Email template generated, sending email...");
      const emailResult = await sendEmail(
        savedBooking.parentEmail,
        "Your AFC Sports Summer Camp Booking Confirmation",
        emailHtml
      );

      if (emailResult.success) {
        console.log(
          `Confirmation email sent successfully to ${savedBooking.parentEmail}`
        );
        console.log("Email message ID:", emailResult.messageId);
        if (emailResult.previewUrl) {
          console.log("Email preview URL:", emailResult.previewUrl);
        }
      } else {
        console.error("Email sending failed:", emailResult.error);
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      console.error("Email error details:", {
        message: emailError.message,
        code: emailError.code,
        command: emailError.command,
        response: emailError.response,
      });
      // Note: The booking was successful, but the email failed.
      // You might want to handle this case, e.g., by queueing the email for a retry.
    }

    res.status(201).json({
      success: true,
      message: "Booking saved successfully",
      bookingId: savedBooking._id,
      booking: savedBooking,
    });
  } catch (error) {
    console.error("Error saving booking:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Failed to save booking",
      error: error.message,
      details: error.name === "ValidationError" ? error.errors : null,
    });
  }
});

app.post("/api/consent-forms", async (req, res) => {
  try {
    const formData = req.body;

    // Basic validation
    if (!formData.parentBooking) {
      return res.status(400).json({
        success: false,
        message: "Missing parent booking information.",
      });
    }

    const newConsentForm = new ConsentForm(formData);
    const savedForm = await newConsentForm.save();

    res.status(201).json({
      success: true,
      message: "Consent form submitted successfully.",
      form: savedForm,
    });
  } catch (error) {
    console.error("Error saving consent form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit consent form.",
      error: error.message,
    });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Parent.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

app.get("/api/test-db", async (req, res) => {
  try {
    // Test database connection
    const testBooking = new Parent({
      firstName: "Test",
      lastName: "User",
      parentEmail: "test@example.com",
      parentPhone: "1234567890",
      parentAddress: "Test Address",
      numberOfChildren: 1,
      children: [
        {
          name: "Test Child",
          age: 8,
          gender: "boy",
        },
      ],
      startDate: "2024-07-01",
      membershipPlan: "3-Days Access",
      location: "abuDhabi",
      totalAmountPaid: 650,
    });

    const saved = await testBooking.save();
    console.log("Test booking saved:", saved._id);

    // Clean up test data
    await Parent.findByIdAndDelete(saved._id);

    res.json({
      success: true,
      message: "Database connection and model working correctly",
    });
  } catch (error) {
    console.error("Database test failed:", error);
    res.status(500).json({
      success: false,
      message: "Database test failed",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
