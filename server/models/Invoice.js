const mongoose = require('mongoose');

// This defines one line item (e.g. "Web Design - 3 hours - $50/hr = $150")
const itemSchema = new mongoose.Schema({
  name:       { type: String, required: true },  // e.g. "Web Design"
  quantity:   { type: Number, required: true },  // e.g. 3
  unitPrice:  { type: Number, required: true },  // e.g. 50
  total:      { type: Number, required: true },  // quantity × unitPrice = 150
});

// This is the main invoice document
const invoiceSchema = new mongoose.Schema({

  // Who owns this invoice (links to the User who created it)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Auto-generated number like INV-001, INV-002
  invoiceNo: {
    type: String,
    required: true,
  },

  // Client details
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    default: '',
  },

  // Line items — array of itemSchema objects above
  items: [itemSchema],

  // Money calculations
  subtotal: {
    type: Number,
    required: true,   // sum of all item totals
  },
  tax: {
    type: Number,
    default: 0,       // tax percentage e.g. 10 means 10%
  },
  total: {
    type: Number,
    required: true,   // subtotal + (subtotal × tax / 100)
  },

  // Invoice status
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Overdue'],  // only these 4 values allowed
    default: 'Draft',
  },

  // Dates
  dueDate: {
    type: Date,
    required: true,
  },

  // Extra notes for the client (optional)
  notes: {
    type: String,
    default: '',
  },

}, { timestamps: true }); // automatically adds createdAt and updatedAt

module.exports = mongoose.model('Invoice', invoiceSchema);