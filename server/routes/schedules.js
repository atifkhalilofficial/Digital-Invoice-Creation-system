const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Schedule = require('../models/Schedule');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { sendInvoiceEmail } = require('../utils/emailService');

// Helper — calculate next run date based on frequency
const getNextRun = (from, frequency) => {
  const date = new Date(from);
  if (frequency === 'weekly')    date.setDate(date.getDate() + 7);
  if (frequency === 'monthly')   date.setMonth(date.getMonth() + 1);
  if (frequency === 'quarterly') date.setMonth(date.getMonth() + 3);
  return date;
};

// Helper — create an invoice from a schedule
const createInvoiceFromSchedule = async (schedule) => {
  const user = await User.findByIdAndUpdate(
    schedule.userId,
    { $inc: { invoiceCount: 1 } },
    { new: true }
  );

  const prefix = user.invoicePrefix || 'INV';
  const invoiceNo = `${prefix}-${String(user.invoiceCount).padStart(3, '0')}`;
  const subtotal = schedule.items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + (subtotal * (schedule.tax || 0) / 100);

  // Due date is startDate + dueDays
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + schedule.dueDays);

  const invoice = new Invoice({
    userId:      schedule.userId,
    invoiceNo,
    clientName:  schedule.clientName,
    clientEmail: schedule.clientEmail,
    items:       schedule.items,
    subtotal,
    tax:         schedule.tax || 0,
    total,
    dueDate,
    notes:       schedule.notes || '',
    status:      schedule.autoSend ? 'Sent' : 'Draft',
    invoiceDate: new Date(),
    scheduleId: schedule._id,
  });

  await invoice.save();

  // Send email if autoSend is on
  if (schedule.autoSend && schedule.clientEmail) {
    try {
      await sendInvoiceEmail(invoice, user.name, user.company);
    } catch (err) {
      console.error('Scheduled email failed:', err.message);
    }
  }

  return invoice;
};

// ─── GET ALL SCHEDULES ───────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── CREATE SCHEDULE ─────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const {
      clientName, clientEmail, items,
      tax, notes, frequency, startDate, dueDays, autoSend
    } = req.body;

    const schedule = new Schedule({
      userId: req.user.id,
      clientName,
      clientEmail,
      items,
      tax:       tax || 0,
      notes:     notes || '',
      frequency,
      startDate: new Date(startDate),
      nextRun:   new Date(startDate),
      dueDays:   dueDays || 30,
      autoSend:  autoSend || false,
      status:    'active',
    });

    await schedule.save();

    // If start date is today or in the past — create first invoice immediately
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    if (start <= today) {
      await createInvoiceFromSchedule(schedule);
      schedule.nextRun = getNextRun(startDate, frequency);
      await schedule.save();
    }

    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── UPDATE SCHEDULE STATUS (pause/cancel/activate) ──────
router.put('/:id/status', protect, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    if (schedule.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    schedule.status = req.body.status;
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── DELETE SCHEDULE ─────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    if (schedule.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await schedule.deleteOne();
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── MANUALLY TRIGGER SCHEDULED INVOICES (run due schedules) ─
router.post('/run', protect, async (req, res) => {
  try {
    const now = new Date();
    const schedules = await Schedule.find({
      userId:  req.user.id,
      status:  'active',
      nextRun: { $lte: now },
    });

    const created = [];
    for (const schedule of schedules) {
      const invoice = await createInvoiceFromSchedule(schedule);
      schedule.nextRun = getNextRun(schedule.nextRun, schedule.frequency);
      await schedule.save();
      created.push(invoice);
    }

    res.json({ message: `${created.length} invoice(s) created`, invoices: created });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ─── GET SINGLE SCHEDULE ─────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    if (schedule.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── UPDATE SCHEDULE ─────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    if (schedule.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      clientName, clientEmail, items,
      tax, notes, frequency, startDate, dueDays, autoSend
    } = req.body;

    schedule.clientName  = clientName;
    schedule.clientEmail = clientEmail;
    schedule.items       = items;
    schedule.tax         = tax || 0;
    schedule.notes       = notes || '';
    schedule.frequency   = frequency;
    schedule.dueDays     = dueDays || 30;
    schedule.autoSend    = autoSend || false;

    // Update nextRun based on new startDate
    if (startDate) {
      schedule.startDate = new Date(startDate);
      schedule.nextRun   = new Date(startDate);
    }

    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;