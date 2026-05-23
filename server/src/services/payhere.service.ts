import crypto from "crypto";

const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || "";
const MERCHANT_SECRET = process.env.PAYHERE_SECRET || "";
const MODE = process.env.PAYHERE_MODE || "sandbox";

export const payhereService = {
  generateHash: (orderId: string, amount: number, currency = "LKR"): string => {
    const amountFormatted = parseFloat(String(amount)).toFixed(2);
    const secretHash = crypto
      .createHash("md5")
      .update(MERCHANT_SECRET)
      .digest("hex")
      .toUpperCase();

    const hashString = `${MERCHANT_ID}${orderId}${amountFormatted}${currency}${secretHash}`;
    return crypto
      .createHash("md5")
      .update(hashString)
      .digest("hex")
      .toUpperCase();
  },

  getCheckoutUrl: (): string => {
    return MODE === "sandbox"
      ? "https://sandbox.payhere.lk/pay/checkout"
      : "https://www.payhere.lk/pay/checkout";
  },

  generateOrderId: (billNumber: string): string => {
    return `PINKLET-${billNumber}-${Date.now()}`;
  },

  verifyCallback: (
    merchantId: string,
    orderId: string,
    paymentId: string,
    payhereAmount: string,
    payhereCurrency: string,
    statusCode: string,
    md5sig: string,
  ): boolean => {
    const secretHash = crypto
      .createHash("md5")
      .update(MERCHANT_SECRET)
      .digest("hex")
      .toUpperCase();

    const hashString = `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${secretHash}`;
    const expectedHash = crypto
      .createHash("md5")
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    return md5sig === expectedHash;
  },
};
