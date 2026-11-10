const MAX_NOTE_LENGTH = 180;
const MAX_AMOUNT_LENGTH = 40;
const NETWORKS = new Set(["testnet", "mainnet"]);

// Conservative shape check only; not proof that an address is valid.
// TODO(Beldex): replace with official SDK/network address validation.
export function isPlausibleBeldexAddress(value) {
  return typeof value === "string" &&
    /^B[1-9A-HJ-NP-Za-km-z]{80,110}$/.test(value.trim());
}

export function validateRequest({ to, amount, note = "", expiry = "", network }) {
  if (!isPlausibleBeldexAddress(to)) throw new Error("Enter a valid-looking Beldex address.");
  if (!amount || amount.length > MAX_AMOUNT_LENGTH ||
      !/^(?:0|[1-9]\d*)(?:\.\d{1,12})?$/.test(amount) ||
      !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    throw new Error("Amount must be a positive number (up to 12 decimals).");
  }
  if (typeof note !== "string" || note.length > MAX_NOTE_LENGTH) {
    throw new Error(`Note must be ${MAX_NOTE_LENGTH} characters or fewer.`);
  }
  if (!NETWORKS.has(network)) throw new Error("Choose a supported network.");
  let expiresAt = null;
  if (expiry) {
    const date = new Date(expiry);
    if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) {
      throw new Error("Expiry must be a future date and time.");
    }
    expiresAt = date.getTime();
  }
  return { to: to.trim(), amount, note: note.trim(), network, expiresAt };
}

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(encoded) {
  if (!/^[A-Za-z0-9_-]+$/.test(encoded)) throw new Error("Malformed payment link.");
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function createPaymentUrl(request) {
  const payload = {
    to: request.to, amount: request.amount, note: request.note, network: request.network,
    ...(request.expiresAt ? { expiresAt: request.expiresAt } : {}),
  };
  const url = new URL(window.location.href);
  url.search = ""; url.hash = "";
  url.searchParams.set("r", toBase64Url(JSON.stringify(payload)));
  return url.toString();
}

export function readPaymentRequest(search = window.location.search) {
  const encoded = new URLSearchParams(search).get("r");
  if (!encoded) return null;
  let request;
  try { request = JSON.parse(fromBase64Url(encoded)); }
  catch { throw new Error("This payment link is invalid or corrupted."); }
  const validated = validateRequest({
    to: request.to, amount: request.amount, note: request.note ?? "", network: request.network,
  });
  if (request.expiresAt !== undefined && request.expiresAt !== null) {
    if (!Number.isFinite(request.expiresAt) || request.expiresAt <= Date.now()) {
      throw new Error("This payment link has expired.");
    }
    validated.expiresAt = request.expiresAt;
  }
  return validated;
}
