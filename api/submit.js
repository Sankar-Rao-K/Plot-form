const ALLOWED_BUDGETS = ["₹35–40 Lakhs", "₹40–45 Lakhs", "₹45–50 Lakhs"];
const ALLOWED_SIZES = ["135–150 sq. yds", "150–180 sq. yds", "180–200 sq. yds"];
const ALLOWED_TIMELINES = ["Immediately", "Within 1 month", "Within 3 months"];

function clean(value, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const name = clean(req.body?.name, 80);
  const phone = clean(req.body?.phone, 30);
  const email = clean(req.body?.email, 120);
  const budget = clean(req.body?.budget, 40);
  const plotSize = clean(req.body?.plotSize, 40);
  const timeline = clean(req.body?.timeline, 40);

  if (name.length < 2 || !/^[+]?[-0-9 ()]{10,16}$/.test(phone) ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
      !ALLOWED_BUDGETS.includes(budget) ||
      !ALLOWED_SIZES.includes(plotSize) ||
      !ALLOWED_TIMELINES.includes(timeline)) {
    return res.status(400).json({ error: "Please check your details and complete all required selections." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Email service is not configured yet. Please try again later." });

  const text = [
    "New plot enquiry received",
    "",
    `Name: ${name}`,
    `Mobile: ${phone}`,
    `Email: ${email || "Not provided"}`,
    `Budget: ${budget}`,
    `Required plot size: ${plotSize}`,
    `Buying timeline: ${timeline}`,
    "",
    "Submitted through the DDS Expo plot enquiry form."
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || "DDS Expo Enquiries <onboarding@resend.dev>",
        to: ["ddsexpoai@gmail.com"],
        subject: `New Plot Enquiry — ${name}`,
        text,
        ...(email ? { reply_to: email } : {})
      })
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("Resend error:", result);
      return res.status(502).json({ error: "We couldn't send your enquiry right now. Please try again shortly." });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email request failed:", error);
    return res.status(502).json({ error: "Email service temporarily unavailable. Please try again." });
  }
}