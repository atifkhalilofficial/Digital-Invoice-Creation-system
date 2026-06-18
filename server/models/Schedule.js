const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // Client Information
    clientName: {type: String, required: true},
    clientEmail: {type: String, required: true},

    // Invoice Template items

    items: [
        {
            name: {type: String, required: true},
            quantity: {type: Number, required: true},
            unitPrice: {type: Number, required: true},
            total: {type: Number, required: true},
        },
    ],

    tax: {type: Number, default: 0},
    notes: {type: String, default: ''},

    // Schedule Settings

    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'],
        required: true
    },
    

    // when to start and next run date

    startDate: {type: Date, required: true},
    nextRun: {type: Date, required: true},

    //  // How many days after creation the invoice is due
    dueDays: {type: Number, default: 30},
    
    // Auto send email or just create draft
  autoSend: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active',
  },

}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);