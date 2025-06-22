const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true, enum: ["boy", "girl"] },
});

// Add a virtual field for age calculation
childSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

// Add validation for age range (4-12 years)
childSchema.pre("save", function (next) {
  const age = this.age;
  if (age < 4 || age > 12) {
    return next(new Error("Child must be between 4 and 12 years old"));
  }
  next();
});

module.exports = childSchema;
