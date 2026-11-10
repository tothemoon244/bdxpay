# Manual testing checklist

This checklist covers the prototype. Demo mode exercises local UI behavior only; it does not send Beldex transactions.

## Setup
- [ ] Install Node.js 18+ and run `npm install`.
- [ ] Start with `npm run dev`.
- [ ] Confirm the testnet warning is visible and Demo mode is enabled.

## Request creation and URL handling
- [ ] Create a request with a plausible-format Beldex address and positive amount.
- [ ] Confirm a shareable URL and QR code appear.
- [ ] Open the URL in a new tab; confirm recipient, amount, note and network.
- [ ] Use a note containing `<script>alert(1)</script>`; confirm it renders as text.
- [ ] Reject an obviously malformed address.
- [ ] Reject zero, negative, non-numeric and over-precision amounts.
- [ ] Reject a note longer than 180 characters.
- [ ] Reject an expiry in the past.
- [ ] Test a link after its expiry and confirm rejection.
- [ ] Alter the `r` query parameter and confirm an invalid-link message.

## Demo flow
- [ ] Connect in Demo mode and confirm the demo wallet label.
- [ ] Submit payment and confirm pending then submitted state.
- [ ] Confirm the `DEMO-` hash is identified as simulated and not verifiable on-chain.
- [ ] Disable Demo mode and confirm live wallet actions remain safely disabled.

## Live integration scenarios (require verified SDK implementation)
- [ ] Wallet rejection: reject a wallet prompt and confirm a clear rejected state.
- [ ] Invalid address: confirm official validator rejects invalid recipients.
- [ ] Insufficient balance: use a testnet wallet with insufficient BDX plus fee.
- [ ] Success: approve a small testnet payment and independently verify it on an official explorer.
- [ ] Confirm wrong-network wallets cannot sign or submit.

## Release gate
Do not enable live payments or advertise mainnet support until SDK verification, testnet integration tests, independent transaction verification and security review are complete.
