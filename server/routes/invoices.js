const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Invoice = require('../models/Invoice');
const User = require('../models/User');

// ─── GET ALL INVOICES ────────────────────────────────────
// GET /api/invoices
router.get('/', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // newest first
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

    // Check invoice exists
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check it belongs to the logged in user
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
    const { clientName, clientEmail, items, tax, dueDate, notes } = req.body;

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
      status:      'Draft',
    });

    await invoice.save();
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

    // Recalculate totals if items were updated
    if (req.body.items) {
      req.body.subtotal = req.body.items.reduce((sum, item) => sum + item.total, 0);
      req.body.total = req.body.subtotal + (req.body.subtotal * (req.body.tax || 0) / 100);
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return the updated version, not the old one
    );

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