const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true,select: false },
    company: { type: String },
    logo: { type: String },
     invoiceCount: { type: Number, default: 0 },
    invoicePrefix: { type: String, default: "INV" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
