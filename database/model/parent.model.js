const mongoose = require("mongoose");
const childSchema = require("./child.model.js");

const parentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    parentEmail: { type: String, required: true },
    parentPhone: { type: String, required: true },
    parentAddress: { type: String, required: true },
    numberOfChildren: { type: Number, required: true },
    children: [childSchema],
    startDate: { type: String, required: true },
    membershipPlan: { type: String, required: true }, // e.g., "3-Days Access", "5-Days Access"
    location: { type: String, required: true },
    totalAmountPaid: { type: Number, required: true }, // Final amount after discounts
  },
  { timestamps: true }
);

module.exports = mongoose.model("Parent", parentSchema);
