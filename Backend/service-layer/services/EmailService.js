const nodemailer = require("nodemailer");

// ---------------------------------------------------------------------------
// Transporter — configured once, reused across all requests
// ---------------------------------------------------------------------------
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for port 465
    auth: {
      user: process.env.SMTP_USER,    // your Gmail address
      pass: process.env.SMTP_PASS,    // App Password (not account password)
    },
    tls: {
      rejectUnauthorized: false,      // allow self-signed certs in dev
    },
  });
};

// ---------------------------------------------------------------------------
// Priority badge colours (inline HTML)
// ---------------------------------------------------------------------------
const priorityColor = {
  High:   "#ef4444",
  Medium: "#f59e0b",
  Low:    "#22c55e",
};

const statusColor = {
  Pending:     "#6b7280",
  "In Progress": "#3b82f6",
  Resolved:    "#22c55e",
  Rejected:    "#ef4444",
};

// ---------------------------------------------------------------------------
// Build the HTML email body
// ---------------------------------------------------------------------------
const buildQueryEmailHTML = (query) => {
  const pColor = priorityColor[query.priority] || "#6b7280";
  const sColor = statusColor[query.status]   || "#6b7280";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Employee Query — InventoryHub</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);
                       padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;
                         letter-spacing:-0.5px;">
                🖥️ InventoryHub
              </h1>
              <p style="margin:8px 0 0;color:#93c5fd;font-size:14px;">
                IT Asset Management System
              </p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="background:#eff6ff;border-left:4px solid #2563eb;
                       padding:16px 40px;">
              <p style="margin:0;color:#1d4ed8;font-size:14px;font-weight:600;">
                📬 New Query Request Submitted
              </p>
              <p style="margin:4px 0 0;color:#3b82f6;font-size:13px;">
                Please review and respond to this employee request.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">

              <!-- Employee Info -->
              <h2 style="margin:0 0 16px;font-size:16px;color:#374151;
                         font-weight:600;text-transform:uppercase;
                         letter-spacing:0.5px;border-bottom:2px solid #e5e7eb;
                         padding-bottom:8px;">
                Employee Information
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0"
                     style="margin-bottom:28px;">
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;
                             width:140px;vertical-align:top;">Employee Name</td>
                  <td style="padding:8px 0;color:#111827;font-size:14px;
                             font-weight:600;">${query.employeeName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;
                             vertical-align:top;">Employee Email</td>
                  <td style="padding:8px 0;color:#2563eb;font-size:14px;">
                    <a href="mailto:${query.employeeEmail}"
                       style="color:#2563eb;text-decoration:none;">
                      ${query.employeeEmail}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;
                             vertical-align:top;">Employee ID</td>
                  <td style="padding:8px 0;color:#111827;font-size:14px;
                             font-family:monospace;font-size:12px;">
                    ${query.employeeId}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;
                             vertical-align:top;">Submitted At</td>
                  <td style="padding:8px 0;color:#111827;font-size:14px;">
                    ${new Date(query.createdAt || Date.now()).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              </table>

              <!-- Query Details -->
              <h2 style="margin:0 0 16px;font-size:16px;color:#374151;
                         font-weight:600;text-transform:uppercase;
                         letter-spacing:0.5px;border-bottom:2px solid #e5e7eb;
                         padding-bottom:8px;">
                Query Details
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0"
                     style="margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;
                             width:140px;vertical-align:top;">Query Type</td>
                  <td style="padding:8px 0;">
                    <span style="background:#dbeafe;color:#1d4ed8;
                                 padding:3px 10px;border-radius:20px;
                                 font-size:13px;font-weight:600;">
                      ${query.queryType}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;
                             vertical-align:top;">Priority</td>
                  <td style="padding:8px 0;">
                    <span style="background:${pColor}22;color:${pColor};
                                 padding:3px 10px;border-radius:20px;
                                 font-size:13px;font-weight:700;">
                      ${query.priority}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;
                             vertical-align:top;">Status</td>
                  <td style="padding:8px 0;">
                    <span style="background:${sColor}22;color:${sColor};
                                 padding:3px 10px;border-radius:20px;
                                 font-size:13px;font-weight:600;">
                      ${query.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;
                             vertical-align:top;">Subject</td>
                  <td style="padding:8px 0;color:#111827;font-size:14px;
                             font-weight:600;">${query.subject}</td>
                </tr>
              </table>

              <!-- Description Box -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;
                          border-radius:8px;padding:20px;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#374151;font-size:14px;
                           font-weight:600;">Description</p>
                <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.7;">
                  ${query.description.replace(/\n/g, "<br/>")}
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin:28px 0;">
                <a href="${process.env.IT_PANEL_URL || "#"}"
                   style="background:linear-gradient(135deg,#1e3a5f,#2563eb);
                          color:#ffffff;padding:14px 36px;border-radius:8px;
                          text-decoration:none;font-size:15px;font-weight:600;
                          display:inline-block;letter-spacing:0.3px;">
                  View in IT-Operation Panel →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;
                       border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                This is an automated message from
                <strong style="color:#6b7280;">InventoryHub</strong> · Do not reply directly.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

// ---------------------------------------------------------------------------
// Main send function
// ---------------------------------------------------------------------------
const sendQueryNotificationEmail = async (query) => {
  try {
    const transporter = createTransporter();

    const itOperationEmail = process.env.IT_OPERATIONS_EMAIL;
    if (!itOperationEmail) {
      console.warn("[Email] IT-OPERATIONS_EMAIL not set — skipping email notification.");
      return;
    }

    const mailOptions = {
      from: `"InventoryHub " <${process.env.SMTP_USER}>`,
      to: itOperationEmail,
      cc: process.env.IT_TEAM_EMAIL || undefined,
      subject: `[InventoryHub] New Query: ${query.queryType} — ${query.priority} Priority`,
      html: buildQueryEmailHTML(query),
      text: `
New Query Submitted — InventoryHub
====================================
Employee   : ${query.employeeName} (${query.employeeEmail})
Employee ID: ${query.employeeId}
Query Type : ${query.queryType}
Priority   : ${query.priority}
Status     : ${query.status}
Subject    : ${query.subject}

Description:
${query.description}

Submitted  : ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Query notification sent → ${info.messageId}`);
    return { 
      success: true, 
      messageId: info.messageId 
    };
  } catch (err) {
    console.error("[Email] Failed to send notification:", err.message);
    return { success: false, error: err.message };
  }
};

// ---------------------------------------------------------------------------
// Optional: Send confirmation email to the employee
// ---------------------------------------------------------------------------
const sendQueryConfirmationEmail = async (query) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"InventoryHub Support" <${process.env.SMTP_USER}>`,
    to: query.employeeEmail,
    subject: `[InventoryHub] Your Query Has Been Received — #${query._id?.toString().slice(-6).toUpperCase()}`,
    html: `
<div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:0 auto;
            padding:32px 24px;background:#ffffff;border-radius:12px;
            box-shadow:0 2px 12px rgba(0,0,0,0.06);">
  <h2 style="color:#1e3a5f;margin:0 0 8px;">Query Received ✅</h2>
  <p style="color:#6b7280;margin:0 0 24px;font-size:14px;">
    Hi <strong>${query.employeeName}</strong>, your query has been submitted successfully.
  </p>
  <div style="background:#f0f9ff;border-radius:8px;padding:20px;margin-bottom:24px;">
    <p style="margin:0 0 6px;font-size:13px;color:#0369a1;">
      <strong>Type:</strong> ${query.queryType}
    </p>
    <p style="margin:0 0 6px;font-size:13px;color:#0369a1;">
      <strong>Priority:</strong> ${query.priority}
    </p>
    <p style="margin:0;font-size:13px;color:#0369a1;">
      <strong>Status:</strong> Pending — Our team will review shortly.
    </p>
  </div>
  <p style="color:#9ca3af;font-size:12px;margin:0;">
    InventoryHub · Automated Confirmation
  </p>
</div>
    `,
    text: `Hi ${query.employeeName}, your query "${query.subject}" (${query.queryType}) has been received. Our IT team will respond shortly.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Confirmation sent to ${query.employeeEmail}`);
  } catch (err) {
    console.warn("[Email] Confirmation email failed:", err.message);
  }
};

module.exports = {
  sendQueryNotificationEmail,
  sendQueryConfirmationEmail,
};
