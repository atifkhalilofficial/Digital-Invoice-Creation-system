const nodemailer = require('nodemailer');

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Format currency
const formatMoney = (amount) => {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

// Send invoice email to client
const sendInvoiceEmail = async (invoice, senderName, senderCompany) => {
  const businessName = senderCompany || senderName || 'SmartBill User';

  // Build line items table rows
  const itemRows = invoice.items.map(item => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #374151;">
        ${item.name}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #374151; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #374151; text-align: center;">
        ${formatMoney(item.unitPrice)}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #374151; text-align: right; font-weight: 600;">
        ${formatMoney(item.total)}
      </td>
    </tr>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">

      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">

        <!-- Header -->
        <div style="background: #4f46e5; padding: 32px 40px;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
            SmartBill
          </h1>
          <p style="margin: 8px 0 0; color: #c7d2fe; font-size: 14px;">
            Invoice from ${businessName}
          </p>
        </div>

        <!-- Invoice Info -->
        <div style="padding: 32px 40px; border-bottom: 1px solid #f1f5f9;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
            <div>
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
                Invoice Number
              </p>
              <p style="margin: 0; font-size: 20px; font-weight: 800; color: #1e293b;">
                ${invoice.invoiceNo}
              </p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
                Amount Due
              </p>
              <p style="margin: 0; font-size: 20px; font-weight: 800; color: #4f46e5;">
                ${formatMoney(invoice.total)}
              </p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
                Billed To
              </p>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">
                ${invoice.clientName}
              </p>
              <p style="margin: 2px 0 0; font-size: 13px; color: #64748b;">
                ${invoice.clientEmail || ''}
              </p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
                Due Date
              </p>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">
                ${new Date(invoice.dueDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <!-- Line Items -->
        <div style="padding: 32px 40px; border-bottom: 1px solid #f1f5f9;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; text-align: left;">
                  Description
                </th>
                <th style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; text-align: center;">
                  Qty
                </th>
                <th style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; text-align: center;">
                  Price
                </th>
                <th style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div style="padding: 24px 40px; border-bottom: 1px solid #f1f5f9;">
          <div style="max-width: 240px; margin-left: auto;">
            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #64748b;">
              <span>Subtotal</span>
              <span>${formatMoney(invoice.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px;">
              <span>Tax (${invoice.tax}%)</span>
              <span>${formatMoney(invoice.subtotal * invoice.tax / 100)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 16px; font-weight: 800; color: #1e293b;">
              <span>Total Due</span>
              <span style="color: #4f46e5;">${formatMoney(invoice.total)}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        ${invoice.notes ? `
        <div style="padding: 24px 40px; border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
          <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
            Notes
          </p>
          <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">
            ${invoice.notes}
          </p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="padding: 24px 40px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">
            This invoice was sent via <strong style="color: #4f46e5;">SmartBill</strong>
          </p>
          <p style="margin: 6px 0 0; font-size: 12px; color: #cbd5e1;">
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