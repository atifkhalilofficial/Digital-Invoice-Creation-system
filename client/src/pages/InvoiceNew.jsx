import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function InvoiceNew() {
  const navigate = useNavigate();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([
    { name: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    const qty = parseFloat(updated[index].quantity) || 0;
    const price = parseFloat(updated[index].unitPrice) || 0;
    updated[index].total = qty * price;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * (parseFloat(tax) || 0)) / 100;
  const total = subtotal + taxAmount;

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleSubmit = async (status) => {
    setError("");
    if (!clientName) return setError("Client name is required");
    if (!dueDate) return setError("Due date is required");

    // Check if due date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove time so today is allowed
    const selected = new Date(dueDate);
    if (selected < today) {
      return setError(
        "Due date cannot be in the past. Please select today or a future date.",
      );
    }

    if (items.some((item) => !item.name))
      return setError("All item names are required");
    setLoading(true);
    try {
      await API.post("/invoices", {
        clientName,
        clientEmail,
        items,
        tax: parseFloat(tax) || 0,
        dueDate,
        notes,
        status,
      });
      navigate("/invoices");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-bg">
      <Navbar showBack backTo="/dashboard" backLabel="Back to Dashboard" />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
          Create New Invoice
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
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Client Email</label>
              <input
                type="email"
                placeholder="ahmed@email.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Invoice Date</label>
              <input type="text" value={todayFormatted} disabled />
              <p className="text-xs text-slate-400 mt-1">Auto-set to today</p>
            </div>

            <div>
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">
                Must be today or a future date
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
                onChange={(e) => setTax(e.target.value)}
              />
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
                placeholder="e.g. Web Design"
                value={item.name}
                onChange={(e) =>
                  handleItemChange(index, "name", e.target.value)
                }
              />
              <input
                className="flex-1 text-center"
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
              />
              <input
                className="flex-1 text-center"
                type="number"
                min="0"
                placeholder="0"
                value={item.unitPrice}
                onChange={(e) =>
                  handleItemChange(index, "unitPrice", e.target.value)
                }
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
              <span className="text-slate-500 dark:text-slate-400">
                Subtotal
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm pb-2 border-b border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">
                Tax ({tax || 0}%)
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                ${taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-bold text-slate-800 dark:text-white">
                Total
              </span>
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
            placeholder="Payment terms, bank details, thank you message..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("Draft")}
            disabled={loading}
            className="btn-secondary"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("Sent")}
            disabled={loading}
            className="btn-primary"
          >
            {loading
              ? "Sending..."
              : clientEmail
                ? "Save & Send Email"
                : "Save & Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
