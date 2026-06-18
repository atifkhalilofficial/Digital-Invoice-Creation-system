import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await API.get("/invoices");
        setInvoices(res.data);
      } catch (err) {
        console.error("Failed to fetch invoices", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const totalInvoices = invoices.length;
  const totalRevenue = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.total, 0);
  const pendingCount = invoices.filter(
    (inv) => inv.status === "Sent" || inv.status === "Overdue",
  ).length;

  const badgeClass = (status) => {
    switch (status) {
      case "Paid":
        return "badge-paid";
      case "Sent":
        return "badge-sent";
      case "Overdue":
        return "badge-overdue";
      default:
        return "badge-draft";
    }
  };

  return (
    <div className="min-h-screen page-bg">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Welcome back, {user?.name} 👋
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Here's your invoicing overview.
            </p>
          </div>
          <button
            onClick={() => navigate("/invoices/new")}
            className="btn-primary"
          >
            + New Invoice
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
              #
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Total Invoices
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {totalInvoices}
            </p>
          </div>

          <div className="card p-5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
              $
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Total Revenue
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              $
              {totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="card p-5">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center mb-3 text-red-500 dark:text-red-400 text-sm font-bold">
              !
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Pending Payment
            </p>
            <p className="text-2xl font-bold text-red-500 dark:text-red-400">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* Recent invoices table */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              Recent Invoices
            </h3>
            <Link
              to="/invoices"
              className="text-xs text-indigo-500 hover:text-indigo-400 no-underline"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <p className="text-slate-500 text-sm p-6">Loading invoices...</p>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm mb-4">No invoices yet.</p>
              <button
                onClick={() => navigate("/invoices/new")}
                className="btn-primary"
              >
                Create your first invoice
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/60">
                  <th className="table-head">Invoice #</th>
                  <th className="table-head">Client</th>
                  <th className="table-head">Amount</th>
                  <th className="table-head">Status</th>
                  <th className="table-head">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv._id} className="table-row">
                    <td className="px-6 py-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {inv.invoiceNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {inv.clientName}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">
                      $
                      {inv.total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeClass(inv.status)}`}
                        >
                          {inv.status}
                        </span>
                        {inv.scheduleId && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                            🔁 Scheduled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(inv.dueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
