import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import InvoiceTemplate from "../components/InvoiceTemplate";

export default function InvoiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const templateRef = useRef();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await API.get(`/invoices/${id}`);
        setInvoice(res.data);
      } catch (err) {
        console.error("Failed to fetch invoice", err);
        navigate("/invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, navigate]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const options = {
        margin: 0,
        filename: `${invoice.invoiceNo}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
      };
      await html2pdf().set(options).from(templateRef.current).save();
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );

  if (!invoice)
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <p className="text-slate-500">Invoice not found.</p>
      </div>
    );

  return (
    <div className="min-h-screen page-bg">
      {/* Custom navbar with back + download */}
      <nav className="navbar px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white">
          Smart<span className="text-indigo-500">Bill</span>
        </h1>
        <div className="flex items-center gap-4">
          <Link
            to="/invoices"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors no-underline"
          >
            ← Back to Invoices
          </Link>
          <button
            onClick={() => navigate(`/invoices/${invoice._id}/edit`)}
            className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Edit Invoice
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`text-sm font-semibold px-4 py-2 rounded-lg border-none transition-colors cursor-pointer ${
              downloading
                ? "bg-indigo-300 dark:bg-indigo-800 text-white cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {downloading ? "Generating PDF..." : "Download PDF"}
          </button>
        </div>
      </nav>

      {/* Invoice preview */}
      <div className="flex justify-center p-8">
        <div className="shadow-lg rounded-xl overflow-hidden">
          <InvoiceTemplate ref={templateRef} invoice={invoice} user={user} />
        </div>
      </div>
    </div>
  );
}
