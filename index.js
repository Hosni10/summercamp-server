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

// Environment variables with fallbacks
const DOMAIN_URL =
  process.env.DOMAIN_URL || "https://summercamp-client.vercel.app";
const SERVER_URL =
  process.env.SERVER_URL || "https://summercamp-server.onrender.com";

console.log("Server CORS Configuration:");
console.log("DOMAIN_URL:", DOMAIN_URL);
console.log("SERVER_URL:", SERVER_URL);

app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      DOMAIN_URL,
      SERVER_URL,
      "https://summercamp-client.vercel.app",
      "https://summercamp-client-67a8.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ];

    console.log("Request origin:", origin);
    console.log("Allowed origins:", allowedOrigins);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Add preflight handler for OPTIONS requests
app.options("*", cors(corsOptions));

// Test endpoint to verify CORS is working
app.get("/test-cors", (req, res) => {
  console.log("Test CORS endpoint hit");
  console.log("Request origin:", req.headers.origin);
  res.json({
    message: "CORS test successful",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
  });
});

const YOUR_DOMAIN = "https://summercamp-client-67a8.vercel.app/"; // Update to your frontend URL

db();

app.post("/create-payment-intent", async (req, res) => {
  console.log("Payment intent request received");
  console.log("Request origin:", req.headers.origin);
  console.log("Request method:", req.method);
  console.log("Request headers:", req.headers);

  try {
    const { amount, currency = "aed" } = req.body;
    console.log("Payment intent amount:", amount, "currency:", currency);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("Payment intent created successfully:", paymentIntent.id);
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
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

    // Determine plan type
    function getPlanType(planName) {
      const kidsCampKeywords = [
        "1-day",
        "3-days",
        "5-days",
        "10-days",
        "20-days",
        "full camp",
      ];
      const name = planName ? planName.toLowerCase() : "";
      for (const keyword of kidsCampKeywords) {
        if (name.includes(keyword)) {
          return "Kids Camp";
        }
      }
      return "Football Clinic";
    }
    const planType = getPlanType(bookingData.plan.name);

    // Function to calculate age from date of birth
    function calculateAge(dateOfBirth) {
      if (!dateOfBirth) return null;
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age;
    }

    // Validate children ages based on plan type
    for (let i = 0; i < bookingData.children.length; i++) {
      const child = bookingData.children[i];
      const age = calculateAge(child.dateOfBirth);

      if (age === null) {
        return res.status(400).json({
          success: false,
          message: `Date of birth is required for child ${i + 1}`,
          error: `Child ${i + 1} date of birth is required`,
        });
      }

      if (planType === "Kids Camp") {
        // Kids Camp: 4-14 years
        if (age < 4) {
          return res.status(400).json({
            success: false,
            message: `Child ${
              i + 1
            } must be at least 4 years old for Kids Camp`,
            error: `Child ${i + 1} age validation failed`,
          });
        }
        if (age > 14) {
          return res.status(400).json({
            success: false,
            message: `Child ${
              i + 1
            } must be 14 years old or younger for Kids Camp`,
            error: `Child ${i + 1} age validation failed`,
          });
        }
      } else {
        // Football Clinic: 4-19 years
        if (age < 4) {
          return res.status(400).json({
            success: false,
            message: `Child ${
              i + 1
            } must be at least 4 years old for Football Clinic`,
            error: `Child ${i + 1} age validation failed`,
          });
        }
        if (age > 19) {
          return res.status(400).json({
            success: false,
            message: `Child ${
              i + 1
            } must be 19 years old or younger for Football Clinic`,
            error: `Child ${i + 1} age validation failed`,
          });
        }
      }
    }

    // Determine discount type
    let discountType = "";
    let discountCode = bookingData.discountCode || "";
    let discountPercent = bookingData.discountPercent || 0;
    if (discountCode === "ADQ20@ADSS2025") {
      discountType = "adq employees";
    } else if (discountCode === "ad20nec") {
      discountType = "adnec employees";
    } else if (discountCode) {
      discountType = "normal";
    }

    // Function to calculate expiry date based on start date and membership plan
    function calculateExpiryDate(startDate, membershipPlan) {
      const start = new Date(startDate);
      let weekdaysToAdd = 0;

      // Extract number of days from membership plan name
      const planName = membershipPlan.toLowerCase();

      // 1-day, 3-day, 5-day plans: Available within 1 week (Monday to Friday)
      if (planName.includes("1-day") || planName.includes("1 day")) {
        weekdaysToAdd = 5; // 5 weekdays (1 week)
      } else if (planName.includes("3-days") || planName.includes("3 days")) {
        weekdaysToAdd = 5; // 5 weekdays (1 week)
      } else if (planName.includes("5-days") || planName.includes("5 days")) {
        weekdaysToAdd = 5; // 5 weekdays (1 week)
      }
      // 10-day and 12-session plans: Available within 2 weeks
      else if (
        planName.includes("10-days") ||
        planName.includes("10 days") ||
        planName.includes("12-session") ||
        planName.includes("12 sessions")
      ) {
        weekdaysToAdd = 10; // 10 weekdays (2 weeks)
      }
      // 20-day and 21-session plans: Available within 1 month
      else if (
        planName.includes("20-days") ||
        planName.includes("20 days") ||
        planName.includes("21-session") ||
        planName.includes("21 sessions")
      ) {
        weekdaysToAdd = 22; // 22 weekdays (approximately 1 month)
      }
      // Full camp plans: Set expiry to end of summer (typically end of August)
      else if (planName.includes("full camp") || planName.includes("full")) {
        const expiry = new Date(start);
        expiry.setMonth(8); // August (0-indexed)
        expiry.setDate(21); // End of August
        return expiry.toISOString().split("T")[0]; // Return as YYYY-MM-DD
      } else {
        // Default to 5 weekdays if plan is not recognized
        weekdaysToAdd = 5;
      }

      // Calculate expiry date by adding weekdays only
      const expiry = new Date(start);
      let addedWeekdays = 0;

      while (addedWeekdays < weekdaysToAdd) {
        expiry.setDate(expiry.getDate() + 1);
        // Check if it's a weekday (Monday = 1, Tuesday = 2, ..., Friday = 5)
        if (expiry.getDay() >= 1 && expiry.getDay() <= 5) {
          addedWeekdays++;
        }
      }

      return expiry.toISOString().split("T")[0]; // Return as YYYY-MM-DD
    }

    // Calculate expiry date
    const expiryDate = calculateExpiryDate(
      bookingData.startDate,
      bookingData.plan.name
    );

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
      expiryDate: expiryDate,
      membershipPlan: bookingData.plan.name,
      location: bookingData.location,
      totalAmountPaid: bookingData.pricing.finalTotal,
      planType: planType,
      discountCode: discountCode,
      discountPercent: discountPercent,
      discountType: discountType,
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
        "Your Atomics Football Summer Camp Booking Confirmation",
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

    // Basic validation (no longer require parentBooking)
    // You may add other required field checks here if needed

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
      expiryDate: "2024-07-03", // 3-day plan
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
