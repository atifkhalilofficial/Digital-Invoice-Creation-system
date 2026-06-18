const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { sendInvoiceEmail } = require('../utils/emailService');


// ─── GET ALL INVOICES ────────────────────────────────────
// GET /api/invoices
router.get('/', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── GET SINGLE INVOICE ──────────────────────────────────
// GET /api/invoices/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── CREATE INVOICE ──────────────────────────────────────
// POST /api/invoices
router.post('/', protect, async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      items,
      tax,
      dueDate,
      notes,
      status,
      sendEmail,
    } = req.body;

    // Auto-generate invoice number using prefix + counter
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { invoiceCount: 1 } },
      { new: true }
    );
    const prefix = user.invoicePrefix || 'INV';
    const invoiceNo = `${prefix}-${String(user.invoiceCount).padStart(3, '0')}`;

    // Calculate subtotal from all line items
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);

    // Calculate final total with tax
    const total = subtotal + (subtotal * (tax || 0) / 100);

    const invoice = new Invoice({
      userId:      req.user.id,
      invoiceNo,
      clientName,
      clientEmail,
      items,
      subtotal,
      tax:         tax || 0,
      total,
      dueDate,
      notes:       notes || '',
      status:      status || 'Draft',
    });

    await invoice.save();

    // Send email only if sendEmail flag is true and client has email
    if (sendEmail && clientEmail) {
      try {
        const sender = await User.findById(req.user.id).select('name company');
        await sendInvoiceEmail(invoice, sender.name, sender.company);
        console.log(`Email sent to ${clientEmail}`);
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr.message);
      }
    }

    res.status(201).json(invoice);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── UPDATE INVOICE ──────────────────────────────────────
// PUT /api/invoices/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Extract sendEmail flag before updating
    const { sendEmail, ...updateData } = req.body;

    // Recalculate totals if items were updated
    if (updateData.items) {
      updateData.subtotal = updateData.items.reduce((sum, item) => sum + item.total, 0);
      updateData.total = updateData.subtotal + (updateData.subtotal * (updateData.tax || 0) / 100);
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Send email only if sendEmail flag is true and client has email
    if (sendEmail && updatedInvoice.clientEmail) {
      try {
        const sender = await User.findById(req.user.id).select('name company');
        await sendInvoiceEmail(updatedInvoice, sender.name, sender.company);
        console.log(`Email sent to ${updatedInvoice.clientEmail}`);
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr.message);
      }
    }

    res.json(updatedInvoice);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── DELETE INVOICE ──────────────────────────────────────
// DELETE /api/invoices/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;