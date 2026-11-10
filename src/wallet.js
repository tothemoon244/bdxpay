/*
 * Wallet integration is isolated here. Exact @bdxi/web3js extension-provider
 * and transaction APIs must be verified against official SDK documentation.
 * No SDK method names are guessed in this prototype.
 *
 * TODO(Beldex SDK):
 * 1. Verify extension provider discovery and supported browser API.
 * 2. Verify account connection and permission method names.
 * 3. Verify transaction construction, fee handling, amount units/decimals,
 *    signing, broadcasting and receipt methods.
 * 4. Verify network identity before signing or submitting.
 */
let connectedAddress = null;

function demoEnabled() {
  return localStorage.getItem("bdxpay-demo") !== "false";
}

export async function connect() {
  if (demoEnabled()) {
    connectedAddress = "BDXPAY-DEMO-WALLET";
    return { address: connectedAddress, demo: true };
  }
  const provider = window.beldex ?? window.beldexProvider;
  if (!provider) {
    throw new Error("Beldex extension wallet not detected. Enable Demo mode or install the supported wallet.");
  }
  // TODO(Beldex SDK): use only the provider contract documented by Beldex.
  throw new Error("Live wallet connection is not enabled until the official @bdxi/web3js extension API is verified.");
}

export async function sendPayment({ to, amount }) {
  if (!connectedAddress) throw new Error("Connect a wallet before paying.");
  if (demoEnabled()) {
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    const random = crypto.getRandomValues(new Uint8Array(32));
    const hash = Array.from(random, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return { hash: `DEMO-${hash}`, status: "submitted", demo: true, to, amount };
  }
  // TODO(Beldex SDK): build, sign and broadcast using verified SDK APIs.
  throw new Error("Live payment submission is not enabled until the official SDK transaction API is verified.");
}

export function disconnect() {
  connectedAddress = null;
}
