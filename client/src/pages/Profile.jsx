import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Profile() {
  const { user, login, token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    invoicePrefix: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load current profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/users/profile');
        setFormData({
          name: res.data.name || '',
          company: res.data.company || '',
          invoicePrefix: res.data.invoicePrefix || 'INV',
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await API.put('/users/profile', formData);

      // Update the user in AuthContext so navbar reflects changes
      login(token, {
        ...user,
        name: res.data.name,
        company: res.data.company,
      });

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <h1 style={styles.navLogo}>SmartBill</h1>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>Dashboard</Link>
          <Link to="/invoices" style={styles.navLink}>Invoices</Link>
        </div>
      </nav>

      <div style={styles.container}>
        <h2 style={styles.pageTitle}>Profile Settings</h2>

        <div style={styles.card}>

          {/* Avatar / Initials */}
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {formData.name
                ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                : 'U'}
            </div>
            <div>
              <p style={styles.avatarName}>{formData.name}</p>
              <p style={styles.avatarEmail}>{user?.email}</p>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Success / Error messages */}
          {success && <div style={styles.success}>{success}</div>}
          {error && <div style={styles.error}>{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit}>

            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                style={{ ...styles.input, ...styles.inputDisabled }}
                type="email"
                value={user?.email}
                disabled
              />
              <p style={styles.hint}>Email cannot be changed</p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Company Name</label>
              <input
                style={styles.input}
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company or business name"
              />
              <p style={styles.hint}>
                Shown on invoice headers instead of your name
              </p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Invoice Prefix</label>
              <div style={styles.prefixRow}>
                <input
                  style={{ ...styles.input, width: '120px' }}
                  type="text"
                  name="invoicePrefix"
                  value={formData.invoicePrefix}
                  onChange={handleChange}
                  placeholder="INV"
                  maxLength={5}
                />
                <div style={styles.prefixPreview}>
                  Preview: <strong>{formData.invoicePrefix || 'INV'}-001</strong>
                </div>
              </div>
              <p style={styles.hint}>
                Prefix used for invoice numbers — e.g. INV, SB, AB
              </p>
            </div>

            <button
              type="submit"
              style={saving ? styles.btnDisabled : styles.btn}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

          </form>
        </div>

        {/* Account Stats */}
        <div style={styles.statsCard}>
          <h3 style={styles.statsTitle}>Account Info</h3>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Invoice Prefix</span>
            <span style={styles.statValue}>{formData.invoicePrefix || 'INV'}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Company</span>
            <span style={styles.statValue}>{formData.company || '—'}</span>
          </div>
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
  container: {
    maxWidth: '640px',
    margin: '0 auto',
    padding: '2rem',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1.75rem',
    marginBottom: '1rem',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    flexShrink: 0,
  },
  avatarName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 2px',
  },
  avatarEmail: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '0 0 1.5rem',
  },
  success: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '1rem',
    border: '1px solid #bbf7d0',
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
  field: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  hint: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '4px 0 0',
  },
  prefixRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  prefixPreview: {
    fontSize: '14px',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '9px 14px',
  },
  btn: {
    padding: '10px 24px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  btnDisabled: {
    padding: '10px 24px',
    backgroundColor: '#93c5fd',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'not-allowed',
    marginTop: '0.5rem',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1.25rem 1.75rem',
  },
  statsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 1rem',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '14px',
  },
  statLabel: {
    color: '#6b7280',
  },
  statValue: {
    color: '#111827',
    fontWeight: '500',
  },
};