import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS?.replace(/\s/g, ""), // remove spaces
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const emailService = {
  sendOTP: async (to: string, otp: string, purpose: "reset" | "change") => {
    const subject =
      purpose === "reset"
        ? "Pinklet POS — Password Reset OTP"
        : "Pinklet POS — Change Password OTP";

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#FFF0F5;font-family:Inter,sans-serif;">
        <div style="max-width:480px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(9,9,9,0.10);">
          
          <!-- Header -->
          <div style="background:#EE2D7C;padding:28px 32px;text-align:center;">
            <p style="margin:0;font-size:24px;font-weight:800;color:white;letter-spacing:-0.5px;">🎀 Pinklet POS</p>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.80);">Point of Sale System</p>
          </div>

          <!-- Body -->
          <div style="padding:32px;">
            <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#090909;">
              ${purpose === "reset" ? "Password Reset Request" : "Change Password Request"}
            </h2>
            <p style="margin:0 0 24px;font-size:14px;color:rgba(9,9,9,0.55);line-height:1.6;">
              ${
                purpose === "reset"
                  ? "You requested to reset your password. Use the OTP below to proceed."
                  : "A request was made to change your cashier account password."
              }
            </p>

            <!-- OTP Box -->
            <div style="background:#FFF0F5;border:2px dashed rgba(238,45,124,0.30);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:rgba(9,9,9,0.45);text-transform:uppercase;letter-spacing:0.08em;">Your OTP Code</p>
              <p style="margin:0;font-size:40px;font-weight:800;color:#EE2D7C;letter-spacing:12px;">${otp}</p>
              <p style="margin:12px 0 0;font-size:12px;color:rgba(9,9,9,0.45);">Valid for <strong>10 minutes</strong></p>
            </div>

            <div style="background:rgba(239,68,68,0.06);border-radius:10px;padding:14px;margin-bottom:16px;">
              <p style="margin:0;font-size:12px;color:#dc2626;">
                ⚠ If you didn't request this, please ignore this email. Your account is safe.
              </p>
            </div>

            <p style="margin:0;font-size:12px;color:rgba(9,9,9,0.35);text-align:center;">
              Powered by Pinklet POS System
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      if (process.env.NODE_ENV !== "production") {
        console.log(`DEV OTP for ${to}: ${otp}`);
      }

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn(`OTP fallback for ${to}: email credentials missing`);
        return { delivered: false, fallback: true, otp };
      }

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `Pinklet POS <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log(`Sent OTP email to ${to} — messageId=${info.messageId}`);
      return { delivered: true, messageId: info.messageId };
    } catch (err) {
      console.error("Failed to send OTP email:", err);
      console.warn(`OTP fallback for ${to}: using local delivery`);
      return { delivered: false, fallback: true, otp };
    }
  },
};
