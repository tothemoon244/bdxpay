import React, { useState } from "react";
import { connect, sendPayment } from "../wallet.js";

export default function PayView({ request, demoMode }) {
  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState("idle");
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");

  async function connectWallet() {
    setError("");
    try { setWallet(await connect()); }
    catch (err) { setError(err.message || "Wallet connection failed."); }
  }

  async function pay() {
    setError(""); setStatus("pending");
    try {
      const result = await sendPayment({ to: request.to, amount: request.amount });
      setHash(result.hash); setStatus("submitted");
    } catch (err) {
      setStatus("failed");
      const message = err.message || "Payment failed.";
      if (/reject|denied|cancel/i.test(message)) setError("Payment was rejected in the wallet.");
      else if (/insufficient/i.test(message)) setError("Insufficient BDX balance for this payment and network fee.");
      else setError(message);
    }
  }

  return <section className="panel pay-panel">
    <div className="section-heading"><div><p className="eyebrow">CUSTOMER</p><h2>Payment request</h2></div><span className="step">02 / PAY</span></div>
    <div className="amount-display"><span>AMOUNT DUE</span><strong>{request.amount} <small>BDX</small></strong></div>
    <dl className="request-details">
      <div><dt>To</dt><dd className="address">{request.to}</dd></div>
      {request.note && <div><dt>Note</dt><dd>{request.note}</dd></div>}
      <div><dt>Network</dt><dd>{request.network}</dd></div>
      {request.expiresAt && <div><dt>Expires</dt><dd>{new Date(request.expiresAt).toLocaleString()}</dd></div>}
    </dl>
    {demoMode && <p className="alert info">Demo mode: no blockchain transaction will be sent.</p>}
    {!wallet ? <button className="primary" onClick={connectWallet}>Connect Beldex wallet</button> :
      <><p className="connected">Connected: <strong>{wallet.address}</strong></p>
        <button className="primary" onClick={pay} disabled={status === "pending"}>
          {status === "pending" ? "Submitting…" : "Approve payment"}
        </button></>}
    {error && <p className="alert error" role="alert">{error}</p>}
    {status === "submitted" && <div className="alert success"><strong>Submitted (demo)</strong><p>Transaction hash</p><code>{hash}</code><small>Demo hashes are simulated and are not verifiable on-chain.</small></div>}
    {status === "pending" && <p className="muted">Waiting for wallet submission…</p>}
    {status === "failed" && <p className="status-failed">Payment failed. Resolve the issue and try again.</p>}
  </section>;
}
