const mongoose = require("mongoose");
const { Schema } = mongoose;

const consentFormSchema = new Schema(
  {
    parentBooking: {
      type: Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
    },
    // Kids Details
    kidFullName: { type: String, required: true },
    dob: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    language: { type: String, required: true },
    // Parent Guardian Details
    parent1Name: { type: String, required: true },
    parent1Relation: { type: String, required: true },
    parent1Phone: { type: String, required: true },
    parent1Email: { type: String, required: true },
    parent2Name: { type: String, required: true },
    parent2Phone: { type: String, required: true },
    // Emergency Contact
    emergencyName: { type: String, required: true },
    emergencyRelation: { type: String, required: true },
    emergencyPhone1: { type: String, required: true },
    emergencyPhone2: { type: String, required: true },
    // Pick Up & Drop
    pickupList: { type: String, required: true },
    pickupName1: { type: String, required: true },
    pickupNumber1: { type: String, required: true },
    pickupName2: { type: String, required: true },
    pickupNumber2: { type: String, required: true },
    // Medical Questionnaire
    medQ1: { type: String, required: true },
    medQ2: { type: String, required: true },
    medQ3: { type: String, required: true },
    medQ4: { type: String, required: true },
    medQ5: { type: String, required: true },
    medQ6: { type: String, required: true },
    medQ7: { type: String, required: true },
    medQ8: { type: String, required: true },
    // Medical Details
    healthInfo: { type: String, required: true },
    medications: { type: String, required: true },
    healthConcerns: { type: String, required: true },
    // Declaration
    guardianName: { type: String, required: true },
    guardianSignature: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConsentForm", consentFormSchema);
