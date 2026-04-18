import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all invoices when page loads
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

  // Calculate stats from invoices
  const totalInvoices = invoices.length;
  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  const pendingCount = invoices
    .filter(inv => inv.status === 'Sent' || inv.status === 'Overdue')
    .length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':     return { backgroundColor: '#dcfce7', color: '#16a34a' };
      case 'Sent':     return { backgroundColor: '#dbeafe', color: '#2563eb' };
      case 'Overdue':  return { backgroundColor: '#fef2f2', color: '#dc2626' };
      default:         return { backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <h1 style={styles.navLogo}>SmartBill</h1>
        <div style={styles.navLinks}>
          <Link to="/invoices" style={styles.navLink}>Invoices</Link>
          <Link to="/profile" style={styles.navLink}>Profile</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.container}>

        {/* Welcome */}
        <div style={styles.welcomeRow}>
          <div>
            <h2 style={styles.welcome}>Welcome back, {user?.name} </h2>
            <p style={styles.welcomeSub}>Here's what's happening with your invoices.</p>
          </div>
          <button
            onClick={() => navigate('/invoices/new')}
            style={styles.createBtn}
          >
            + New Invoice
          </button>
        </div>

        {/* Stat Cards */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Invoices</p>
            <p style={styles.statValue}>{totalInvoices}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Revenue</p>
            <p style={styles.statValue}>
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Pending Payment</p>
            <p style={styles.statValue}>{pendingCount}</p>
          </div>
        </div>

        {/* Recent Invoices Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Recent Invoices</h3>
            <Link to="/invoices" style={styles.viewAll}>View all →</Link>
          </div>

          {loading ? (
            <p style={styles.emptyMsg}>Loading invoices...</p>
          ) : invoices.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyMsg}>No invoices yet.</p>
              <button
                onClick={() => navigate('/invoices/new')}
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
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv._id} style={styles.tableRow}>
                    <td style={styles.td}>{inv.invoiceNo}</td>
                    <td style={styles.td}>{inv.clientName}</td>
                    <td style={styles.td}>
                      ${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...getStatusColor(inv.status) }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(inv.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
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
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navLink: {
    fontSize: '14px',
    color: '#6b7280',
    textDecoration: 'none',
    fontWeight: '500',
  },
  logoutBtn: {
    fontSize: '14px',
    color: '#dc2626',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem',
  },
  welcomeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  welcome: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px',
  },
  welcomeSub: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  createBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1.25rem',
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 6px',
  },
  statValue: {
    fontSize: '26px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1.25rem',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  viewAll: {
    fontSize: '13px',
    color: '#2563eb',
    textDecoration: 'none',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeadRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  th: {
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    padding: '8px 12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#374151',
  },
  badge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
  },
  emptyMsg: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '1rem',
  },
};