/**
 * Local stand-in for the SSLCommerz sandbox — no network, no real money.
 *
 *   node tests/mocks/sslcommerz-mock.mjs            (listens on http://localhost:4010)
 *
 * Point the app at it with (.env.local):
 *   SSLCZ_STORE_ID=mock_store  SSLCZ_STORE_PASSWORD=mock_pass  SSLCZ_BASE_URL=http://localhost:4010
 *
 * Endpoints (same paths as the real gateway):
 *   POST /gwprocess/v4/api.php                          → session + GatewayPageURL
 *   GET  /validator/api/validationserverAPI.php?val_id= → validation result
 *   GET  /validator/api/merchantTransIDvalidationAPI.php?tran_id=
 *   GET  /pay/:key                                      → fake payment page (Pay / Fail / Cancel)
 * Test helpers:
 *   POST /simulate/:key/pay?amount=&ipn=0|1  → marks paid, sends the IPN, returns { val_id }
 */
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";

const PORT = Number(process.env.MOCK_PORT ?? 4010);
const STORE = { id: "mock_store", password: "mock_pass" };
const sessions = new Map(); // key → session
const validations = new Map(); // val_id → validation

const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};
const readBody = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(new URLSearchParams(data)));
  });
const post = (url, fields) =>
  fetch(url, { method: "POST", body: new URLSearchParams(fields), redirect: "manual" }).catch(
    (err) => console.error("callback failed", url, err.message),
  );

function pay(session, amount) {
  const valId = `VAL${randomBytes(6).toString("hex")}`;
  const validation = {
    status: "VALID",
    tran_id: session.tran_id,
    val_id: valId,
    amount: (amount ?? session.amount).toFixed(2),
    currency: "BDT",
    bank_tran_id: `BANK${randomBytes(4).toString("hex")}`,
    card_type: "BKASH-BKash",
    risk_level: "0",
  };
  validations.set(valId, validation);
  session.validation = validation;
  return validation;
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "POST" && url.pathname === "/gwprocess/v4/api.php") {
    const f = await readBody(req);
    if (f.get("store_id") !== STORE.id || f.get("store_passwd") !== STORE.password) {
      return json(res, 200, { status: "FAILED", failedreason: "Store Credential Error" });
    }
    const key = randomBytes(8).toString("hex");
    sessions.set(key, {
      tran_id: f.get("tran_id"),
      amount: Number(f.get("total_amount")),
      success_url: f.get("success_url"),
      fail_url: f.get("fail_url"),
      cancel_url: f.get("cancel_url"),
      ipn_url: f.get("ipn_url"),
    });
    return json(res, 200, {
      status: "SUCCESS",
      sessionkey: key,
      GatewayPageURL: `http://localhost:${PORT}/pay/${key}`,
    });
  }

  if (req.method === "GET" && url.pathname === "/validator/api/validationserverAPI.php") {
    if (url.searchParams.get("store_id") !== STORE.id)
      return json(res, 200, { status: "INVALID_TRANSACTION" });
    return json(
      res,
      200,
      validations.get(url.searchParams.get("val_id")) ?? { status: "INVALID_TRANSACTION" },
    );
  }

  if (req.method === "GET" && url.pathname === "/validator/api/merchantTransIDvalidationAPI.php") {
    const tranId = url.searchParams.get("tran_id");
    const element = [...validations.values()].filter((v) => v.tran_id === tranId);
    return json(res, 200, { APIConnect: "DONE", no_of_trans_found: element.length, element });
  }

  const payPage = url.pathname.match(/^\/pay\/(\w+)$/);
  if (req.method === "GET" && payPage) {
    const s = sessions.get(payPage[1]);
    if (!s) return json(res, 404, { error: "unknown session" });
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(`<!doctype html><title>Mock SSLCommerz</title>
<h1>Mock SSLCommerz — ${s.tran_id} — ৳${s.amount}</h1>
<form method="post" action="/simulate/${payPage[1]}/pay-redirect"><button>Pay</button></form>
<form method="post" action="${s.fail_url}"><input type="hidden" name="tran_id" value="${s.tran_id}"><input type="hidden" name="status" value="FAILED"><button>Fail</button></form>
<form method="post" action="${s.cancel_url}"><input type="hidden" name="tran_id" value="${s.tran_id}"><input type="hidden" name="status" value="CANCELLED"><button>Cancel</button></form>`);
  }

  const sim = url.pathname.match(/^\/simulate\/(\w+)\/(pay|pay-redirect)$/);
  if (req.method === "POST" && sim) {
    const s = sessions.get(sim[1]);
    if (!s) return json(res, 404, { error: "unknown session" });
    const amount = url.searchParams.has("amount")
      ? Number(url.searchParams.get("amount"))
      : undefined;
    const v = pay(s, amount);
    const fields = { tran_id: v.tran_id, val_id: v.val_id, amount: v.amount, status: "VALID" };
    if (url.searchParams.get("ipn") !== "0") await post(s.ipn_url, fields);
    if (sim[2] === "pay-redirect") {
      // Browser flow: auto-submit to success_url like the real gateway does.
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(
        `<form id="f" method="post" action="${s.success_url}">${Object.entries(fields)
          .map(([k, val]) => `<input type="hidden" name="${k}" value="${val}">`)
          .join("")}</form><script>f.submit()</script>`,
      );
    }
    return json(res, 200, { val_id: v.val_id, tran_id: v.tran_id });
  }

  json(res, 404, { error: "not found" });
}).listen(PORT, () => console.log(`Mock SSLCommerz on http://localhost:${PORT}`));
