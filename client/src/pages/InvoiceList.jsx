import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function InvoiceList() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await API.get('/invoices');
        setInvoices(res.data);
      } catch (err) {
        console.error('Failed to fetch invoices', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await API.delete(`/invoices/${id}`);
      setInvoices(invoices.filter(inv => inv._id !== id));
    } catch (err) {
      console.error('Failed to delete invoice', err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/invoices/${id}`, { status: newStatus });
      setInvoices(invoices.map(inv =>
        inv._id === id ? { ...inv, status: newStatus } : inv
      ));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const badgeClass = (status) => {
    switch (status) {
      case 'Paid':    return 'badge-paid';
      case 'Sent':    return 'badge-sent';
      case 'Overdue': return 'badge-overdue';
      default:        return 'badge-draft';
    }
  };

  const filtered = invoices
    .filter(inv => statusFilter === 'All' || inv.status === statusFilter)
    .filter(inv => inv.clientName.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen page-bg">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            All Invoices
          </h2>
          <button
            onClick={() => navigate('/invoices/new')}
            className="btn-primary"
          >
            + New Invoice
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by client name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-64"
          />
          <div className="flex gap-2 flex-wrap">
            {['All', 'Draft', 'Sent', 'Paid', 'Overdue'].map(status => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <p className="text-slate-500 text-sm p-6">Loading invoices...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm mb-4">No invoices found.</p>
              <button
                onClick={() => navigate('/invoices/new')}
                className="btn-primary"
              >
                Create your first invoice
              </button>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700/60">
                    <th className="table-head">Invoice #</th>
                    <th className="table-head">Client</th>
                    <th className="table-head">Amount</th>
                    <th className="table-head">Status</th>
                    <th className="table-head">Due Date</th>
                    <th className="table-head">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(inv => (
                    <tr key={inv._id} className="table-row">

                      <td className="px-6 py-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {inv.invoiceNo}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 m-0">
                          {inv.clientName}
                        </p>
                        <p className="text-xs text-slate-400 m-0">
                          {inv.clientEmail}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">
                        ${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={inv.status}
                          onChange={e => handleStatusChange(inv._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border w-auto cursor-pointer ${badgeClass(inv.status)}`}
                        >
                          {['Draft', 'Sent', 'Paid', 'Overdue'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(inv.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/invoices/${inv._id}`)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(inv._id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 p-4 border-t border-slate-200 dark:border-slate-700/60">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-transparent"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                        currentPage === i + 1
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-transparent"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}