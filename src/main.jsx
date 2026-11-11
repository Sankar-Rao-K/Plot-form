import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Landmark, MapPin, Phone, Route, ShieldCheck } from "lucide-react";
import "./styles.css";

const OWNER = { name: "Murthy Kotla", phone: "7997755228", phoneDisplay: "79977 55228" };

const budgets = ["₹35–40 Lakhs", "₹40–45 Lakhs", "₹45–50 Lakhs"];
const plotSizes = ["135–150 sq. yds", "150–180 sq. yds", "180–200 sq. yds"];
const timelines = ["Immediately", "Within 1 month", "Within 3 months"];

const highlights = [
  { Icon: MapPin, lines: ["1km to", "Shadnagar"], tone: "blue" },
  { Icon: Route, lines: ["NH 44", "Facing"], tone: "green" },
  { Icon: ShieldCheck, lines: ["HMDA &", "RERA", "Approved"], tone: "purple" },
  { Icon: Landmark, lines: ["Bank Loan", "Facility"], tone: "teal" }
];

const EMPTY = { name: "", phone: "", email: "", budget: "", plotSize: "", timeline: "", website: "" };

function SelectField({ id, label, options, value, onChange, placeholder }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label} <b>*</b></label>
      <div className={`select-wrap ${value ? "has-value" : ""}`}>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={19} strokeWidth={2.6} />
      </div>
    </div>
  );
}

function Stepper({ step }) {
  return (
    <ol className="stepper" aria-label="Progress">
      <li className={step >= 1 ? "on" : ""}><span>1</span> Plot details</li>
      <li className="bar" aria-hidden="true"><i style={{ width: step >= 2 ? "100%" : "0%" }} /></li>
      <li className={step >= 2 ? "on" : ""}><span>2</span> Your details</li>
    </ol>
  );
}

function App() {
  const [form, setForm] = useState(EMPTY);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const update = (key, value) => setForm((c) => ({ ...c, [key]: value }));
  const plotReady = form.budget && form.plotSize && form.timeline;

  function goNext(e) {
    e.preventDefault();
    if (!plotReady) return;
    setError("");
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const digits = form.phone.replace(/\D/g, "");
    if (form.name.trim().length < 2) { setError("Please enter your full name."); return; }
    if (!/^[+]?[0-9 ()-]+$/.test(form.phone.trim()) || digits.length < 10 || digits.length > 13) {
      setError("Please enter a valid 10-digit mobile number."); return;
    }
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to submit your enquiry.");
      setStatus("success");
      setForm(EMPTY);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function reset() { setStatus("idle"); setStep(1); setError(""); }

  return (
    <main className="page">
      <section className="card">
        <div className="banner">
          <img src="/owner.jpg" alt={`${OWNER.name}, DDS Expo`} width="900" height="650" fetchpriority="high" />
        </div>

        <div className="headline" role="heading" aria-level={1}>
          <span className="brush red"><em>Double</em> <small>your</small><br /><strong>Investment</strong></span>
          <span className="brush yellow"><small>in</small> <b>3</b> <strong>Years</strong></span>
        </div>

        <ul className="highlights">
          {highlights.map(({ Icon, lines, tone }) => (
            <li key={lines.join(" ")} className={tone}>
              <Icon size={30} strokeWidth={2.2} />
              <span>{lines.map((l) => <i key={l}>{l}</i>)}</span>
            </li>
          ))}
        </ul>

        <div className="form-panel" id="form-panel">
          {status === "success" ? (
            <div className="success">
              <div className="success-icon"><CheckCircle2 size={38} /></div>
              <h2>Thank you for your interest!</h2>
              <p>Your enquiry has been received. <b>{OWNER.name}</b> and team will contact you shortly with suitable plot options.</p>
              <a className="call-btn" href={`tel:+91${OWNER.phone}`}><Phone size={18} /> Call now · {OWNER.phoneDisplay}</a>
              <div><button type="button" className="link-btn" onClick={reset}>Submit another enquiry</button></div>
            </div>
          ) : (
            <>
              <div className="panel-head">
                <h2>Find your perfect plot</h2>
                <p>Answer a few quick questions. Our team will get back to you with the best options.</p>
              </div>
              <Stepper step={step} />

              {step === 1 ? (
                <form onSubmit={goNext} noValidate>
                  <SelectField id="budget" label="What is your budget?" placeholder="Select your budget"
                    options={budgets} value={form.budget} onChange={(v) => update("budget", v)} />
                  <SelectField id="plotSize" label="What plot size do you need?" placeholder="Select plot size"
                    options={plotSizes} value={form.plotSize} onChange={(v) => update("plotSize", v)} />
                  <SelectField id="timeline" label="When are you planning to buy?" placeholder="Select timeline"
                    options={timelines} value={form.timeline} onChange={(v) => update("timeline", v)} />
                  <button className="primary" type="submit" disabled={!plotReady}>
                    Continue <ArrowRight size={19} strokeWidth={2.6} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="recap">
                    <span>{form.budget}</span><span>{form.plotSize}</span><span>{form.timeline}</span>
                    <button type="button" className="link-btn" onClick={() => setStep(1)}>Edit</button>
                  </div>

                  {/* Honeypot: hidden from people, bots fill it in. */}
                  <div className="hp" aria-hidden="true">
                    <label>Website <input tabIndex={-1} autoComplete="off" value={form.website}
                      onChange={(e) => update("website", e.target.value)} /></label>
                  </div>

                  <div className="field">
                    <label htmlFor="name">Full name <b>*</b></label>
                    <input id="name" className="input" maxLength="80" autoComplete="name" placeholder="Enter your full name"
                      value={form.name} onChange={(e) => update("name", e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Mobile number <b>*</b></label>
                    <input id="phone" className="input" type="tel" inputMode="tel" maxLength="20" autoComplete="tel"
                      placeholder="Enter your mobile number" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email address <small>(optional)</small></label>
                    <input id="email" className="input" type="email" maxLength="120" autoComplete="email"
                      placeholder="name@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                  </div>

                  {error && <div className="error" role="alert">{error}</div>}

                  <div className="actions">
                    <button type="button" className="back" onClick={() => { setStep(1); setError(""); }} aria-label="Back to plot details">
                      <ArrowLeft size={19} strokeWidth={2.6} />
                    </button>
                    <button className="primary" type="submit" disabled={status === "loading"}>
                      {status === "loading" ? "Submitting..." : <>Submit enquiry <ArrowRight size={19} strokeWidth={2.6} /></>}
                    </button>
                  </div>
                </form>
              )}

              <a className="call-strip" href={`tel:+91${OWNER.phone}`}>
                <Phone size={16} /> Prefer to talk? Call <b>{OWNER.name}</b> · {OWNER.phoneDisplay}
              </a>
              <p className="privacy"><ShieldCheck size={14} /> Your details are used only to contact you about this enquiry.</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
