// Vercel serverless function: receives the enquiry and emails it via Resend.
//
// Environment variables (Vercel -> Settings -> Environment Variables):
//   RESEND_API_KEY       (required) your Resend API key
//   TO_EMAIL             (optional) inbox that receives enquiries. Default: ddsexpoai@gmail.com
//   MAIL_FROM            (optional) e.g. "DDS Expo <enquiries@yourdomain.com>" (domain must be verified in Resend).
//                        Default: Resend test sender, which can ONLY deliver to your own Resend account email.
//   SEND_CUSTOMER_COPY   (optional) set to "true" to also email an acknowledgement to the customer.
//                        Requires a verified domain in MAIL_FROM.

const ALLOWED_BUDGETS = ["₹35–40 Lakhs", "₹40–45 Lakhs", "₹45–50 Lakhs"];
const ALLOWED_SIZES = ["135–150 sq. yds", "150–180 sq. yds", "180–200 sq. yds"];
const ALLOWED_TIMELINES = ["Immediately", "Within 1 month", "Within 3 months"];
const TEST_SENDER = "DDS Expo Enquiries <onboarding@resend.dev>";

function clean(value, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function row(label, value) {
  return `<tr>
    <td style="padding:10px 14px;background:#f4f7f4;color:#5b6b61;font-size:13px;width:38%;border-bottom:1px solid #e6ece6">${label}</td>
    <td style="padding:10px 14px;color:#17231f;font-size:14px;font-weight:600;border-bottom:1px solid #e6ece6">${value}</td>
  </tr>`;
}

function enquiryHtml(d, receivedAt) {
  const phoneLink = `<a href="tel:${esc(d.phone.replace(/[^\d+]/g, ""))}" style="color:#254b35;text-decoration:none">${esc(d.phone)}</a>`;
  const emailCell = d.email
    ? `<a href="mailto:${esc(d.email)}" style="color:#254b35;text-decoration:none">${esc(d.email)}</a>`
    : `<span style="color:#929b94;font-weight:400">Not provided</span>`;
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f7f5;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e3e9e3;border-radius:12px;border-collapse:separate;overflow:hidden">
    <tr><td style="background:#254b35;padding:20px 24px;color:#ffffff">
      <div style="font-size:12px;letter-spacing:2px;opacity:.8">DDS EXPO</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px">New plot enquiry</div>
    </td></tr>
    <tr><td style="padding:20px 24px 8px">
      <table role="presentation" width="100%" style="border-collapse:collapse;border:1px solid #e6ece6">
        ${row("Name", esc(d.name))}
        ${row("Mobile", phoneLink)}
        ${row("Email", emailCell)}
        ${row("Budget", esc(d.budget))}
        ${row("Plot size", esc(d.plotSize))}
        ${row("Buying timeline", esc(d.timeline))}
      </table>
    </td></tr>
    <tr><td style="padding:12px 24px 22px;color:#8a948d;font-size:12px">
      Received ${esc(receivedAt)} (IST) via the DDS Expo plot enquiry form.${d.email ? " Reply to this email to respond to the customer directly." : ""}
    </td></tr>
  </table></body></html>`;
}

function customerHtml(d) {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f7f5;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e3e9e3;border-radius:12px;border-collapse:separate">
    <tr><td style="padding:28px 28px 8px;color:#17231f">
      <div style="font-size:12px;letter-spacing:2px;color:#65836e">DDS EXPO</div>
      <h2 style="margin:10px 0 12px;font-size:22px">Thank you, ${esc(d.name)}.</h2>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#4b5a51">We've received your plot enquiry. Our team will contact you soon with suitable options.</p>
      <p style="margin:0;font-size:14px;line-height:1.8;color:#4b5a51">
        <b>Budget:</b> ${esc(d.budget)}<br><b>Plot size:</b> ${esc(d.plotSize)}<br><b>Planning to buy:</b> ${esc(d.timeline)}
      </p>
    </td></tr>
    <tr><td style="padding:18px 28px 26px;color:#929b94;font-size:12px">This is an automated acknowledgement.</td></tr>
  </table></body></html>`;
}

async function sendEmail(apiKey, payload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  let result = {};
  try { result = await response.json(); } catch { /* non-JSON response */ }
  return { ok: response.ok, status: response.status, result };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body && typeof body === "object" ? body : {};

  // Spam protection: hidden "website" field that real users never fill in.
  // Pretend success so bots don't learn anything.
  if (clean(body.website, 200)) return res.status(200).json({ success: true });

  const data = {
    name: clean(body.name, 80),
    phone: clean(body.phone, 30),
    email: clean(body.email, 120),
    budget: clean(body.budget, 40),
    plotSize: clean(body.plotSize, 40),
    timeline: clean(body.timeline, 40)
  };

  const phoneDigits = data.phone.replace(/\D/g, "");
  if (
    data.name.length < 2 ||
    !/^[+]?[0-9 ()-]+$/.test(data.phone) || phoneDigits.length < 10 || phoneDigits.length > 13 ||
    (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) ||
    !ALLOWED_BUDGETS.includes(data.budget) ||
    !ALLOWED_SIZES.includes(data.plotSize) ||
    !ALLOWED_TIMELINES.includes(data.timeline)
  ) {
    return res.status(400).json({ error: "Please check your details and complete all required selections." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set in the Vercel environment variables.");
    return res.status(500).json({ error: "Email service is not configured yet. Please try again later." });
  }

  const to = (process.env.TO_EMAIL || "ddsexpoai@gmail.com").trim();
  const from = (process.env.MAIL_FROM || TEST_SENDER).trim();
  const receivedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

  const text = [
    "New plot enquiry received",
    "",
    `Name: ${data.name}`,
    `Mobile: ${data.phone}`,
    `Email: ${data.email || "Not provided"}`,
    `Budget: ${data.budget}`,
    `Required plot size: ${data.plotSize}`,
    `Buying timeline: ${data.timeline}`,
    "",
    `Received ${receivedAt} (IST) via the DDS Expo plot enquiry form.`
  ].join("\n");

  try {
    const main = await sendEmail(apiKey, {
      from,
      to: [to],
      subject: `New Plot Enquiry — ${data.name} (${data.budget})`,
      html: enquiryHtml(data, receivedAt),
      text,
      ...(data.email ? { reply_to: data.email } : {})
    });

    if (!main.ok) {
      // Full detail goes to the Vercel function logs; customers only see a friendly message.
      console.error(`Resend rejected the enquiry email (HTTP ${main.status}):`, JSON.stringify(main.result));
      return res.status(502).json({ error: "We couldn't send your enquiry right now. Please try again shortly." });
    }

    // Optional acknowledgement to the customer. Never fails the submission.
    if (process.env.SEND_CUSTOMER_COPY === "true" && data.email) {
      try {
        const ack = await sendEmail(apiKey, {
          from,
          to: [data.email],
          subject: "We've received your plot enquiry — DDS Expo",
          html: customerHtml(data),
          reply_to: to
        });
        if (!ack.ok) console.error(`Customer acknowledgement failed (HTTP ${ack.status}):`, JSON.stringify(ack.result));
      } catch (err) {
        console.error("Customer acknowledgement request failed:", err);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email request failed:", error);
    return res.status(502).json({ error: "Email service temporarily unavailable. Please try again." });
  }
}
