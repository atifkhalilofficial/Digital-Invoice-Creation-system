import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

export default function InvoiceNew() {
  const navigate = useNavigate();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Line items — start with one empty row
  const [items, setItems] = useState([
    { name: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  // Update a specific field in a specific line item row
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // Auto-calculate the row total
    const qty = parseFloat(updated[index].quantity) || 0;
    const price = parseFloat(updated[index].unitPrice) || 0;
    updated[index].total = qty * price;

    setItems(updated);
  };

  // Add a new empty row
  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  // Remove a row (minimum 1 row always)
  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculate subtotal and total
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (parseFloat(tax) || 0) / 100;
  const total = subtotal + taxAmount;

  // Submit the invoice
  const handleSubmit = async (status) => {
    setError('');

    // Basic validation
    if (!clientName) return setError('Client name is required');
    if (!dueDate) return setError('Due date is required');
    if (items.some(item => !item.name)) return setError('All item names are required');

    setLoading(true);
    try {
      await API.post('/invoices', {
        clientName,
        clientEmail,
        items,
        tax: parseFloat(tax) || 0,
        dueDate,
        notes,
        status,
      });
      navigate('/invoices');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <h1 style={styles.navLogo}>SmartBill</h1>
        <Link to="/" style={styles.navBack}>← Back to Dashboard</Link>
      </nav>

      <div style={styles.container}>
        <h2 style={styles.pageTitle}>Create New Invoice</h2>

        {error && <div style={styles.error}>{error}</div>}

        {/* Client Details */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Client Details</h3>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Client Name *</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Ahmed Khan"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Client Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="ahmed@email.com"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
              />
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Due Date *</label>
              <input
                style={styles.input}
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Tax (%)</label>
              <input
                style={styles.input}
                type="number"
                placeholder="0"
                min="0"
                max="100"
                value={tax}
                onChange={e => setTax(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Line Items</h3>

          {/* Table Header */}
          <div style={styles.itemHeader}>
            <span style={{ flex: 3 }}>Item Name</span>
            <span style={{ flex: 1, textAlign: 'center' }}>Qty</span>
            <span style={{ flex: 1, textAlign: 'center' }}>Unit Price</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Total</span>
            <span style={{ width: '40px' }}></span>
          </div>

          {/* Item Rows */}
          {items.map((item, index) => (
            <div key={index} style={styles.itemRow}>
              <input
                style={{ ...styles.input, flex: 3 }}
                type="text"
                placeholder="e.g. Web Design"
                value={item.name}
                onChange={e => handleItemChange(index, 'name', e.target.value)}
              />
              <input
                style={{ ...styles.input, flex: 1, textAlign: 'center' }}
                type="number"
                min="1"
                value={item.quantity}
                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
              />
              <input
                style={{ ...styles.input, flex: 1, textAlign: 'center' }}
                type="number"
                min="0"
                placeholder="0"
                value={item.unitPrice}
                onChange={e => handleItemChange(index, 'unitPrice', e.target.value)}
              />
              <span style={styles.itemTotal}>
                ${item.total.toFixed(2)}
              </span>
              <button
                onClick={() => removeItem(index)}
                style={styles.removeBtn}
                disabled={items.length === 1}
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add Row Button */}
          <button onClick={addItem} style={styles.addItemBtn}>
            + Add Item
          </button>
        </div>

        {/* Totals */}
        <div style={styles.section}>
          <div style={styles.totalsBox}>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Subtotal</span>
              <span style={styles.totalValue}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Tax ({tax || 0}%)</span>
              <span style={styles.totalValue}>${taxAmount.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.totalRow, ...styles.grandTotalRow }}>
              <span style={styles.grandTotalLabel}>Total</span>
              <span style={styles.grandTotalValue}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Notes</h3>
          <textarea
            style={styles.textarea}
            placeholder="Payment terms, bank details, thank you message..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button
            onClick={() => navigate('/')}
            style={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('Draft')}
            style={styles.draftBtn}
            disabled={loading}
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit('Sent')}
            style={styles.sendBtn}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save & Send'}
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  navbar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 2rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLogo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2563eb',
    margin: 0,
  },
  navBack: {
    fontSize: '14px',
    color: '#6b7280',
    textDecoration: 'none',
  },
  container: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '2rem',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1.5rem',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '1rem',
    border: '1px solid #fecaca',
  },
  section: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 1rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  itemHeader: {
    display: 'flex',
    gap: '8px',
    padding: '0 0 8px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '8px',
    alignItems: 'center',
  },
  itemRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    alignItems: 'center',
  },
  itemTotal: {
    flex: 1,
    textAlign: 'right',
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    padding: '9px 4px',
  },
  removeBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addItemBtn: {
    marginTop: '8px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px dashed #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#6b7280',
    cursor: 'pointer',
    width: '100%',
  },
  totalsBox: {
    maxWidth: '320px',
    marginLeft: 'auto',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '14px',
    color: '#6b7280',
  },
  totalLabel: {
    color: '#6b7280',
  },
  totalValue: {
    color: '#111827',
    fontWeight: '500',
  },
  grandTotalRow: {
    borderTop: '1px solid #e5e7eb',
    marginTop: '6px',
    paddingTop: '10px',
  },
  grandTotalLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },
  grandTotalValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2563eb',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '1rem',
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    fontSize: '14px',
    color: '#6b7280',
    cursor: 'pointer',
  },
  draftBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500',
    cursor: 'pointer',
  },
  sendBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    fontSize: '14px',
    color: '#ffffff',
    fontWeight: '500',
    cursor: 'pointer',
  },
};