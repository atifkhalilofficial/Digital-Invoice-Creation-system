import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function ScheduleNew() {
  const navigate = useNavigate();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dueDays, setDueDays] = useState(30);
  const [autoSend, setAutoSend] = useState(false);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { name: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    const qty = parseFloat(updated[index].quantity) || 0;
    const price = parseFloat(updated[index].unitPrice) || 0;
    updated[index].total = qty * price;
    setItems(updated);
  };

  const addItem = () => setItems([...items, { name: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (parseFloat(tax) || 0) / 100;
  const total = subtotal + taxAmount;

  const handleSubmit = async () => {
    setError('');
    if (!clientName) return setError('Client name is required');
    if (!startDate) return setError('Start date is required');
    if (items.some(item => !item.name)) return setError('All item names are required');

    setLoading(true);
    try {
      await API.post('/schedules', {
        clientName,
        clientEmail,
        items,
        tax: parseFloat(tax) || 0,
        notes,
        frequency,
        startDate,
        dueDays: parseInt(dueDays),
        autoSend,
      });
      navigate('/schedules');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-bg">
      <Navbar showBack backTo="/schedules" backLabel="Back to Schedules" />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
          New Scheduled Invoice
        </h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        {/* Client Details */}
        <div className="card p-6 mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Client Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Client Name *</label>
              <input
                type="text"
                placeholder="Ahmed Khan"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Client Email</label>
              <input
                type="email"
                placeholder="ahmed@email.com"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Schedule Settings */}
        <div className="card p-6 mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Schedule Settings
          </h3>
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="form-label">Frequency</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly (every 3 months)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">
                First invoice created on this date
              </p>
            </div>

            <div>
              <label className="form-label">Payment Due (days)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={dueDays}
                onChange={e => setDueDays(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">
                Days after creation invoice is due
              </p>
            </div>

            <div>
              <label className="form-label">Tax (%)</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                max="100"
                value={tax}
                onChange={e => setTax(e.target.value)}
              />
            </div>

          </div>

          {/* Auto send toggle */}
          <div className="flex items-center gap-3 mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setAutoSend(!autoSend)}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer border-none relative ${
                autoSend ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                autoSend ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Auto-send email to client
              </p>
              <p className="text-xs text-slate-400">
                {autoSend
                  ? 'Invoice will be emailed automatically on each billing date'
                  : 'Invoice will be saved as Draft — you send it manually'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card p-6 mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Line Items
          </h3>

          <div className="flex gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide pb-2 border-b border-slate-200 dark:border-slate-700/60 mb-3">
            <span className="flex-[3]">Item Name</span>
            <span className="flex-1 text-center">Qty</span>
            <span className="flex-1 text-center">Price</span>
            <span className="flex-1 text-right">Total</span>
            <span className="w-10"></span>
          </div>

          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center mb-2">
              <input
                className="flex-[3]"
                type="text"
                placeholder="e.g. Monthly Hosting"
                value={item.name}
                onChange={e => handleItemChange(index, 'name', e.target.value)}
              />
              <input
                className="flex-1 text-center"
                type="number"
                min="1"
                value={item.quantity}
                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
              />
              <input
                className="flex-1 text-center"
                type="number"
                min="0"
                placeholder="0"
                value={item.unitPrice}
                onChange={e => handleItemChange(index, 'unitPrice', e.target.value)}
              />
              <span className="flex-1 text-right text-sm font-semibold text-indigo-600 dark:text-indigo-400 px-1">
                ${item.total.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="w-8 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-500 text-xs transition-colors border-none cursor-pointer disabled:opacity-30"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="w-full mt-2 py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-500 text-sm rounded-lg transition-colors bg-transparent cursor-pointer"
          >
            + Add Item
          </button>
        </div>

        {/* Totals */}
        <div className="card p-6 mb-4">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Subtotal per cycle</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm pb-2 border-b border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Tax ({tax || 0}%)</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                ${taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-bold text-slate-800 dark:text-white">Total per cycle</span>
              <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card p-6 mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Notes
          </h3>
          <textarea
            placeholder="Monthly retainer, service description..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Summary box */}
        <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
            Schedule Summary
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            A <strong>${total.toFixed(2)}</strong> invoice will be created for{' '}
            <strong>{clientName || 'your client'}</strong> every{' '}
            <strong>{frequency === 'quarterly' ? '3 months' : frequency.replace('ly', '')}</strong>,
            starting <strong>{startDate}</strong>.{' '}
            {autoSend
              ? 'It will be emailed automatically.'
              : 'It will be saved as Draft for you to review.'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/schedules')}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}