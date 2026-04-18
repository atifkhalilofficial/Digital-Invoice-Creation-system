import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import InvoiceTemplate from '../components/InvoiceTemplate';

export default function InvoiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const templateRef = useRef();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Fetch the invoice
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await API.get(`/invoices/${id}`);
        setInvoice(res.data);
      } catch (err) {
        console.error('Failed to fetch invoice', err);
        navigate('/invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, navigate]);

  // Download as PDF
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const options = {
        margin: 0,
        filename: `${invoice.invoiceNo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' },
      };
      await html2pdf().set(options).from(templateRef.current).save();
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (!invoice) return <p style={{ padding: '2rem' }}>Invoice not found.</p>;

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <h1 style={styles.navLogo}>SmartBill</h1>
        <div style={styles.navLinks}>
          <Link to="/invoices" style={styles.navLink}>← Back to Invoices</Link>
          <button
            onClick={handleDownload}
            style={downloading ? styles.downloadBtnDisabled : styles.downloadBtn}
            disabled={downloading}
          >
            {downloading ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </nav>

      {/* Invoice Preview */}
      <div style={styles.previewWrapper}>
        <InvoiceTemplate
          ref={templateRef}
          invoice={invoice}
          user={user}
        />
      </div>

    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
  },
  navbar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 2rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
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
    gap: '1rem',
  },
  navLink: {
    fontSize: '14px',
    color: '#6b7280',
    textDecoration: 'none',
  },
  downloadBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 18px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  downloadBtnDisabled: {
    backgroundColor: '#93c5fd',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 18px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'not-allowed',
  },
  previewWrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem',
  },
};