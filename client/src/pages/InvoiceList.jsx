import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

export default function InvoiceList() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch all invoices on load
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

  // Delete an invoice
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;
    try {
      await API.delete(`/invoices/${id}`);
      const updated = invoices.filter((inv) => inv._id !== id);
      setInvoices(updated);
    } catch (err) {
      console.error("Failed to delete invoice", err);
    }
  };

  // Update invoice status
  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/invoices/${id}`, { status: newStatus });
      const updated = invoices.map((inv) =>
        inv._id === id ? { ...inv, status: newStatus } : inv,
      );
      setInvoices(updated);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return { backgroundColor: "#dcfce7", color: "#16a34a" };
      case "Sent":
        return { backgroundColor: "#dbeafe", color: "#2563eb" };
      case "Overdue":
        return { backgroundColor: "#fef2f2", color: "#dc2626" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#6b7280" };
    }
  };

  // Calculate filtered results directly — no useEffect needed
  const filtered = invoices
    .filter((inv) => statusFilter === "All" || inv.status === statusFilter)
    .filter((inv) =>
      inv.clientName.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h1 style={styles.navLogo}>SmartBill</h1>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>
            Dashboard
          </Link>
          <Link to="/profile" style={styles.navLink}>
            Profile
          </Link>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>All Invoices</h2>
          <button
            onClick={() => navigate("/invoices/new")}
            style={styles.createBtn}
          >
            + New Invoice
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div style={styles.filterBar}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={styles.statusButtons}>
            {["All", "Draft", "Sent", "Paid", "Overdue"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={
                  statusFilter === status
                    ? styles.filterBtnActive
                    : styles.filterBtn
                }
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        <div style={styles.tableCard}>
          {loading ? (
            <p style={styles.emptyMsg}>Loading invoices...</p>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyMsg}>No invoices found.</p>
              <button
                onClick={() => navigate("/invoices/new")}
                style={styles.createBtn}
              >
                Create your first invoice
              </button>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Invoice #</th>
                  <th style={styles.th}>Client</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Due Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv._id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <span style={styles.invoiceNo}>{inv.invoiceNo}</span>
                    </td>

                    <td style={styles.td}>
                      <p style={styles.clientName}>{inv.clientName}</p>
                      <p style={styles.clientEmail}>{inv.clientEmail}</p>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.amount}>
                        $
                        {inv.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {/* Clickable status — cycles through statuses */}
                      <select
                        value={inv.status}
                        onChange={(e) =>
                          handleStatusChange(inv._id, e.target.value)
                        }
                        style={{
                          ...styles.badge,
                          ...getStatusColor(inv.status),
                        }}
                      >
                        {["Draft", "Sent", "Paid", "Overdue"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={styles.td}>
                      {new Date(inv.dueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button
                          onClick={() => navigate(`/invoices/${inv._id}`)}
                          style={styles.viewBtn}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(inv._id)}
                          style={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      </div>
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

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
  },
  navbar: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "0 2rem",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navLogo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#2563eb",
    margin: 0,
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  navLink: {
    fontSize: "14px",
    color: "#6b7280",
    textDecoration: "none",
    fontWeight: "500",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2rem",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#111827",
    margin: 0,
  },
  createBtn: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  filterBar: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchInput: {
    padding: "9px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    width: "260px",
  },
  statusButtons: {
    display: "flex",
    gap: "6px",
  },
  filterBtn: {
    padding: "7px 14px",
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    fontSize: "13px",
    color: "#6b7280",
    cursor: "pointer",
  },
  filterBtnActive: {
    padding: "7px 14px",
    borderRadius: "20px",
    border: "1px solid #2563eb",
    backgroundColor: "#2563eb",
    fontSize: "13px",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "500",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "1.25rem",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeadRow: {
    borderBottom: "1px solid #e5e7eb",
  },
  th: {
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    padding: "8px 12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#374151",
    verticalAlign: "middle",
  },
  invoiceNo: {
    fontWeight: "600",
    color: "#111827",
  },
  clientName: {
    margin: 0,
    fontWeight: "500",
    color: "#111827",
  },
  clientEmail: {
    margin: 0,
    fontSize: "12px",
    color: "#9ca3af",
  },
  amount: {
    fontWeight: "600",
    color: "#111827",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
  },
  actionBtns: {
    display: "flex",
    gap: "8px",
  },
  deleteBtn: {
    padding: "5px 12px",
    borderRadius: "6px",
    border: "1px solid #fecaca",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    fontSize: "12px",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
  },
  emptyMsg: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "1rem",
  },
  viewBtn: {
    padding: "5px 12px",
    borderRadius: "6px",
    border: "1px solid #bfdbfe",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    cursor: "pointer",
  },
};
