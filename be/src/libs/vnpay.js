import { VNPay, ignoreLogger } from "vnpay";

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE,
  secureSecret: process.env.VNPAY_SECURE_SECRET,
  vnpayHost: process.env.VNPAY_HOST,
  testMode: true,
  hashAlgorithm: "SHA512",
  enableLog: true,
  loggerFn: ignoreLogger,
});

export default vnpay;
