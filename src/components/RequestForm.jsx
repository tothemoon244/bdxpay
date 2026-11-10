import React, { useState } from "react";
import QRCode from "qrcode";
import { createPaymentUrl, validateRequest } from "../request.js";

export default function RequestForm({ network, setNetwork }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [expiry, setExpiry] = useState("");
  const [link, setLink] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate(event) {
    event.preventDefault(); setError(""); setCopied(false);
    try {
      const request = validateRequest({ to, amount, note, expiry, network });
      const url = createPaymentUrl(request);
      const image = await QRCode.toDataURL(url, {
        errorCorrectionLevel: "M", margin: 2, width: 260,
        color: { dark: "#101a24", light: "#ffffff" },
      });
      setLink(url); setQr(image);
    } catch (err) {
      setError(err.message || "Could not create payment request."); setLink(""); setQr("");
    }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied(true); }
    catch { setError("Clipboard access failed. Select and copy the link manually."); }
  }

  return <section className="panel">
    <div className="section-heading">
      <div><p className="eyebrow">MERCHANT</p><h2>Create a payment link</h2></div>
      <span className="step">01 / CREATE</span>
    </div>
    <form onSubmit={generate}>
      <label>Beldex receiving address
        <input value={to} onChange={(e) => setTo(e.target.value)} required autoComplete="off"
          spellCheck="false" placeholder="Enter your Beldex address" />
      </label>
      <div className="field-grid">
        <label>Amount (BDX)
          <input value={amount} onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal" required placeholder="0.00" />
        </label>
        <label>Network
          <select value={network} onChange={(e) => setNetwork(e.target.value)}>
            <option value="testnet">Testnet</option>
            <option value="mainnet">Mainnet (live payments disabled)</option>
          </select>
        </label>
      </div>
      <label>Note <span className="muted">Optional · max 180 characters</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={180}
          placeholder="What is this payment for?" />
      </label>
      <label>Link expiry <span className="muted">Optional</span>
        <input type="datetime-local" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
      </label>
      {error && <p className="alert error" role="alert">{error}</p>}
      <button className="primary" type="submit">Generate payment link <span>↗</span></button>
    </form>
    {link && <div className="generated">
      <div><p className="eyebrow">YOUR CHECKOUT LINK</p><p className="link-value">{link}</p>
        <button className="secondary" type="button" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
      </div>
      <img className="qr" src={qr} alt="QR code for this payment link" />
    </div>}
  </section>;
}
