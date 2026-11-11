import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import "./styles.css";

const budgets = ["₹35–40 Lakhs", "₹40–45 Lakhs", "₹45–50 Lakhs"];
const plotSizes = ["135–150 sq. yds", "150–180 sq. yds", "180–200 sq. yds"];
const timelines = ["Immediately", "Within 1 month", "Within 3 months"];

function ChoiceGroup({ label, name, options, value, onChange }) {
  return (
    <fieldset className="field-group">
      <legend>{label}<span className="required"> *</span></legend>
      <div className="choices">
        {options.map((option) => (
          <label className={`choice ${value === option ? "selected" : ""}`} key={option}>
            <input type="radio" name={name} value={option} checked={value === option}
              onChange={() => onChange(option)} />
            <span className="radio-mark" />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function App() {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", budget: "", plotSize: "", timeline: ""
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit your enquiry.");
      setStatus("success");
      setForm({ name: "", phone: "", email: "", budget: "", plotSize: "", timeline: "" });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="form-card">
        <header className="brand-row">
          <div className="brand-mark"><MapPin size={21} strokeWidth={2.2} /></div>
          <div>
            <div className="brand-name">DDS EXPO</div>
            <div className="brand-caption">PROPERTY ENQUIRY</div>
          </div>
          <span className="secure-tag"><ShieldCheck size={14} /> Secure form</span>
        </header>

        {status === "success" ? (
          <div className="success-panel">
            <div className="success-icon"><CheckCircle2 size={34} /></div>
            <p className="eyebrow">ENQUIRY RECEIVED</p>
            <h1>Thank you for your interest.</h1>
            <p className="intro">Your preferences have been submitted successfully. Our team will contact you soon.</p>
            <button className="submit-button" onClick={() => setStatus("idle")}>Submit another enquiry <ArrowRight size={17} /></button>
          </div>
        ) : (
          <>
            <div className="intro-block">
              <div className="eyebrow"><Sparkles size={14} /> LET'S FIND YOUR PLOT</div>
              <h1>Your ideal plot<br /><span>starts here.</span></h1>
              <p className="intro">Tell us what you're looking for. We'll help you explore the right options.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="section-heading"><span>01</span><div><h2>Your details</h2><p>How can we reach you?</p></div></div>
              <div className="input-grid">
                <label className="text-field">
                  <span>Full name <b>*</b></span>
                  <input required minLength="2" maxLength="80" autoComplete="name"
                    placeholder="Enter your name" value={form.name} onChange={(e) => update("name", e.target.value)} />
                </label>
                <label className="text-field">
                  <span>Mobile number <b>*</b></span>
                  <input required type="tel" inputMode="tel" pattern="[+]?[0-9]{10,15}"
                    autoComplete="tel" placeholder="Enter mobile number" value={form.phone}
                    onChange={(e) => update("phone", e.target.value)} />
                </label>
                <label className="text-field full-width">
                  <span>Email address <small>(optional)</small></span>
                  <input type="email" maxLength="120" autoComplete="email" placeholder="name@example.com"
                    value={form.email} onChange={(e) => update("email", e.target.value)} />
                </label>
              </div>

              <div className="section-heading section-gap"><span>02</span><div><h2>Your plot preferences</h2><p>Choose the options that suit you best.</p></div></div>
              <ChoiceGroup label="What is your budget?" name="budget" options={budgets}
                value={form.budget} onChange={(v) => update("budget", v)} />
              <ChoiceGroup label="What plot size do you require?" name="plotSize" options={plotSizes}
                value={form.plotSize} onChange={(v) => update("plotSize", v)} />
              <ChoiceGroup label="When are you planning to buy?" name="timeline" options={timelines}
                value={form.timeline} onChange={(v) => update("timeline", v)} />

              {error && <div className="error-message" role="alert">{error}</div>}
              <button className="submit-button" type="submit"
                disabled={status === "loading" || !form.budget || !form.plotSize || !form.timeline}>
                {status === "loading" ? "Submitting..." : "Submit your enquiry"}
                {status !== "loading" && <ArrowRight size={18} />}
              </button>
              <p className="privacy-note"><ShieldCheck size={14} /> Your information will only be used to contact you about this enquiry.</p>
            </form>
          </>
        )}
        <footer> DDS EXPO <span>•</span> PROPERTY ENQUIRIES</footer>
      </section>
      <p className="outside-note">A simple way to take the next step towards your new plot.</p>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);