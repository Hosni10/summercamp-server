const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 4, max: 12 },
  gender: { type: String, required: true, enum: ["boy", "girl"] },
});

module.exports = childSchema;
