import React, { useEffect, useState } from "react";
import RequestForm from "./components/RequestForm.jsx";
import PayView from "./components/PayView.jsx";
import { readPaymentRequest } from "./request.js";

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("bdxpay-theme") || "dark");
  const [network, setNetwork] = useState("testnet");
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem("bdxpay-demo") !== "false");
  const [request, setRequest] = useState(null);
  const [linkError, setLinkError] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("bdxpay-theme", theme);
  }, [theme]);
  useEffect(() => { localStorage.setItem("bdxpay-demo", String(demoMode)); }, [demoMode]);
  useEffect(() => {
    try {
      const parsed = readPaymentRequest();
      if (parsed) { setRequest(parsed); setNetwork(parsed.network); }
    } catch (err) { setLinkError(err.message); }
  }, []);

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href={window.location.pathname}><span className="brand-mark">B</span><span>BDX<span className="brand-light">PAY</span></span></a>
      <div className="header-actions">
        <label className="toggle-label"><input type="checkbox" checked={demoMode}
          onChange={(e) => setDemoMode(e.target.checked)} /> Demo mode</label>
        <button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle color theme">{theme === "dark" ? "☀" : "☾"}</button>
      </div>
    </header>
    <div className="warning"><strong>TESTNET PROTOTYPE</strong><span>Do not use real funds. Live wallet payments are not enabled in this build.</span></div>
    <section className="hero">
      <p className="eyebrow">BELDEX · PRIVATE CHECKOUT</p>
      <h1>Private payment links,<br /><em>built on Beldex.</em></h1>
      <p>Create a link. Share it anywhere. Let customers approve payments in their own wallet.</p>
    </section>
    {linkError ? <section className="panel"><div className="alert error" role="alert">{linkError}</div><a href={window.location.pathname}>Create a new payment request</a></section> :
      request ? <PayView request={request} demoMode={demoMode} /> :
      <RequestForm network={network} setNetwork={setNetwork} />}
    <footer><span>BDXPAY · Open prototype</span><span>No accounts · No custody · No trackers</span></footer>
  </main>;
}
