/**
 * Local stand-in for the aamarPay sandbox — no network, no real money.
 *
 *   node tests/mocks/aamarpay-mock.mjs          (listens on http://localhost:4011)
 *
 * Point the app at it with .env.local:  AAMARPAY_BASE_URL=http://localhost:4011
 * and in Admin → Settings → Payments enable aamarPay with store id "mock_aamar" and signature
 * key "mock_signature".
 *
 * Endpoints (same paths as the real gateway):
 *   POST /jsonpost.php                               → { result: "true", payment_url }
 *   GET  /api/v1/trxcheck/request.php?request_id=    → transaction status
 *   GET  /paynow/:key                                → fake payment page (Pay / Fail / Cancel)
 * Test helper:
 *   POST /simulate/:key/pay?amount=                  → marks paid, returns { tran_id }
 */
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";

const PORT = Number(process.env.MOCK_PORT ?? 4011);
const STORE = { id: "mock_aamar", signature: "mock_signature" };
const sessions = new Map(); // key → session
const transactions = new Map(); // tran_id → transaction

const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};
const readJson = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });

function pay(session, amount) {
  const tx = {
    pay_status: "Successful",
    status_code: "2",
    mer_txnid: session.tran_id,
    pg_txnid: `AAM${randomBytes(6).toString("hex")}`,
    bank_trxid: `BKASH${randomBytes(4).toString("hex")}`,
    amount: (amount ?? session.amount).toFixed(2),
    currency: "BDT",
    card_type: "bKash-bKash",
  };
  transactions.set(session.tran_id, tx);
  return tx;
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "POST" && url.pathname === "/jsonpost.php") {
    const b = await readJson(req);
    if (b.store_id !== STORE.id || b.signature_key !== STORE.signature) {
      return json(res, 200, { result: "false", error: "Invalid Store ID or Signature Key" });
    }
    const key = randomBytes(8).toString("hex");
    sessions.set(key, {
      tran_id: b.tran_id,
      amount: Number(b.amount),
      success_url: b.success_url,
      fail_url: b.fail_url,
      cancel_url: b.cancel_url,
    });
    transactions.set(b.tran_id, {
      pay_status: "Pending",
      mer_txnid: b.tran_id,
      amount: b.amount,
      currency: "BDT",
    });
    return json(res, 200, {
      result: "true",
      payment_url: `http://localhost:${PORT}/paynow/${key}`,
    });
  }

  if (req.method === "GET" && url.pathname === "/api/v1/trxcheck/request.php") {
    if (url.searchParams.get("store_id") !== STORE.id)
      return json(res, 200, { Error: "Invalid store" });
    const tx = transactions.get(url.searchParams.get("request_id"));
    return json(res, 200, tx ?? { Error: "Transaction not found" });
  }

  const page = url.pathname.match(/^\/paynow\/(\w+)$/);
  if (req.method === "GET" && page) {
    const s = sessions.get(page[1]);
    if (!s) return json(res, 404, { error: "unknown session" });
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(`<!doctype html><meta charset="utf-8"><title>Mock aamarPay</title>
<h1>Mock aamarPay — ${s.tran_id} — ৳${s.amount}</h1>
<form method="post" action="/simulate/${page[1]}/pay-redirect"><button>Pay</button></form>
<form method="post" action="${s.fail_url}"><input type="hidden" name="mer_txnid" value="${s.tran_id}"><input type="hidden" name="pay_status" value="Failed"><button>Fail</button></form>
<form method="post" action="${s.cancel_url}"><input type="hidden" name="mer_txnid" value="${s.tran_id}"><button>Cancel</button></form>`);
  }

  const sim = url.pathname.match(/^\/simulate\/(\w+)\/(pay|pay-redirect)$/);
  if (req.method === "POST" && sim) {
    const s = sessions.get(sim[1]);
    if (!s) return json(res, 404, { error: "unknown session" });
    const amount = url.searchParams.has("amount")
      ? Number(url.searchParams.get("amount"))
      : undefined;
    const tx = pay(s, amount);
    if (sim[2] === "pay-redirect") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(
        `<form id="f" method="post" action="${s.success_url}">${Object.entries(tx)
          .map(([k, v]) => `<input type="hidden" name="${k}" value="${v}">`)
          .join("")}</form><script>f.submit()</script>`,
      );
    }
    return json(res, 200, { tran_id: tx.mer_txnid });
  }

  json(res, 404, { error: "not found" });
}).listen(PORT, () => console.log(`Mock aamarPay on http://localhost:${PORT}`));
