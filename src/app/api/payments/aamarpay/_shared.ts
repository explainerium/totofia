import "server-only";

/** Fields aamarPay posts to our callback URLs (only the transaction id is used). */
export async function readAamarpayForm(req: Request) {
  const form = await req.formData().catch(() => null);
  const get = (key: string) => {
    const value = form?.get(key);
    return typeof value === "string" && value.length <= 200 ? value : undefined;
  };
  return { tranId: get("mer_txnid"), reason: get("pay_status") };
}
