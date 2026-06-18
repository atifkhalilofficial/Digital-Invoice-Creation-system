const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatMoney = (amount) => {
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

const sendInvoiceEmail = async (invoice, senderName, senderCompany) => {
  const businessName = senderCompany || senderName || 'SmartBill User';

  const itemRows = invoice.items.map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151;">
        ${item.name}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151;text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151;text-align:center;">
        ${formatMoney(item.unitPrice)}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151;text-align:right;font-weight:600;">
        ${formatMoney(item.total)}
      </td>
    </tr>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">

        <!-- Header -->
        <div style="background:#4f46e5;padding:32px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">SmartBill</h1>
          <p style="margin:8px 0 0;color:#c7d2fe;font-size:14px;">Invoice from ${businessName}</p>
        </div>

        <!-- Invoice Info -->
        <div style="padding:32px 40px;border-bottom:1px solid #f1f5f9;">
          <table style="width:100%;">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Invoice Number</p>
                <p style="margin:0;font-size:20px;font-weight:800;color:#1e293b;">${invoice.invoiceNo}</p>
              </td>
              <td style="text-align:right;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Amount Due</p>
                <p style="margin:0;font-size:20px;font-weight:800;color:#4f46e5;">${formatMoney(invoice.total)}</p>
              </td>
            </tr>
          </table>

          <table style="width:100%;margin-top:24px;">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Billed To</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">${invoice.clientName}</p>
                <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${invoice.clientEmail || ''}</p>
              </td>
              <td style="text-align:right;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Due Date</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">
                  ${new Date(invoice.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Line Items -->
        <div style="padding:32px 40px;border-bottom:1px solid #f1f5f9;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;text-align:left;">Description</th>
                <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;text-align:center;">Qty</th>
                <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;text-align:center;">Price</th>
                <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div style="padding:24px 40px;border-bottom:1px solid #f1f5f9;">
          <table style="width:240px;margin-left:auto;">
            <tr>
              <td style="padding:5px 0;font-size:14px;color:#64748b;">Subtotal</td>
              <td style="padding:5px 0;font-size:14px;color:#64748b;text-align:right;">${formatMoney(invoice.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;font-size:14px;color:#64748b;border-bottom:1px solid #e2e8f0;">Tax (${invoice.tax}%)</td>
              <td style="padding:5px 0;font-size:14px;color:#64748b;text-align:right;border-bottom:1px solid #e2e8f0;">
                ${formatMoney(invoice.subtotal * invoice.tax / 100)}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0 0;font-size:16px;font-weight:800;color:#1e293b;">Total Due</td>
              <td style="padding:10px 0 0;font-size:16px;font-weight:800;color:#4f46e5;text-align:right;">${formatMoney(invoice.total)}</td>
            </tr>
          </table>
        </div>

        ${invoice.notes ? `
        <!-- Notes -->
        <div style="padding:24px 40px;background:#f8fafc;border-bottom:1px solid #f1f5f9;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Notes</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${invoice.notes}</p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:13px;color:#94a3b8;">
            This invoice was sent via <strong style="color:#4f46e5;">SmartBill</strong>
          </p>
          <p style="margin:6px 0 0;font-size:12px;color:#cbd5e1;">
            Please contact ${businessName} if you have any questions.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${businessName}" <${process.env.EMAIL_USER}>`,
    to: invoice.clientEmail,
    subject: `Invoice ${invoice.invoiceNo} from ${businessName} — ${formatMoney(invoice.total)} due`,
    html: emailHtml,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendInvoiceEmail };