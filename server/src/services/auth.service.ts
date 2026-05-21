import { db } from "../utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { emailService } from "../utils/email";
import { signToken } from "../utils/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "pinklet-secret";
const JWT_EXPIRES = "7d";

export const authService = {
  getSetupStatus: async () => {
    const ownerCount = await db.user.count({ where: { role: "owner" } });
    return { setupComplete: ownerCount > 0 };
  },

  // Step 1 — Send OTP to email before creating owner
  sendOwnerSetupOTP: async (email: string, shopName: string) => {
    // Check if owner already exists
    const existingOwner = await db.user.count({ where: { role: "owner" } });
    if (existingOwner > 0) throw new Error("OWNER_EXISTS");

    // Check if email already taken
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) throw new Error("EMAIL_EXISTS");

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert setup record
    await db.ownerSetup.upsert({
      where: { email },
      update: { otp, verified: false, expiresAt },
      create: { email, otp, verified: false, expiresAt },
    });

    // Send email
    await emailService.sendOTP(email, otp, "reset");

    return { message: "OTP sent" };
  },

  // Step 2 — Verify OTP
  verifyOwnerSetupOTP: async (email: string, otp: string) => {
    const setup = await db.ownerSetup.findUnique({ where: { email } });
    if (!setup) throw new Error("SETUP_NOT_FOUND");
    if (setup.expiresAt < new Date()) throw new Error("OTP_EXPIRED");
    if (setup.otp !== otp) throw new Error("INVALID_OTP");

    await db.ownerSetup.update({
      where: { email },
      data: { verified: true },
    });

    return { verified: true };
  },

  // Step 3 — Complete owner registration
  completeOwnerSetup: async (data: {
    email: string;
    name: string;
    shopName: string;
    password: string;
  }) => {
    // Check setup was verified
    const setup = await db.ownerSetup.findUnique({
      where: { email: data.email },
    });
    if (!setup || !setup.verified) throw new Error("EMAIL_NOT_VERIFIED");

    // Double check no owner exists
    const existingOwner = await db.user.count({ where: { role: "owner" } });
    if (existingOwner > 0) throw new Error("OWNER_EXISTS");

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const owner = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "owner",
      },
    });

    // Clean up setup record
    await db.ownerSetup.delete({ where: { email: data.email } });

    // Generate token
    const token = signToken({ userId: owner.id, role: owner.role });

    return {
      token,
      user: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
      },
    };
  },

  login: async (email: string, password: string) => {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) throw new Error("INVALID_CREDENTIALS");
    if (!user.isActive) throw new Error("ACCOUNT_DISABLED");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("INVALID_CREDENTIALS");

    const token = signToken({ userId: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  // Cashier login by name (no email)
  cashierLogin: async (userId: string, password: string) => {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("INVALID_CREDENTIALS");
    if (!user.isActive) throw new Error("ACCOUNT_DISABLED");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("INVALID_CREDENTIALS");

    const token = signToken({ userId: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  getAccounts: async () => {
    return db.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, role: true, email: true },
      orderBy: { role: "asc" },
    });
  },

  sendForgotPasswordOTP: async (email: string) => {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) throw new Error("NOT_FOUND");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.ownerSetup.upsert({
      where: { email },
      update: { otp, verified: false, expiresAt },
      create: { email, otp, verified: false, expiresAt },
    });

    await emailService.sendOTP(email, otp, "reset");
    return { message: "OTP sent" };
  },

  verifyForgotOTP: async (email: string, otp: string) => {
    const setup = await db.ownerSetup.findUnique({ where: { email } });
    if (!setup) throw new Error("NOT_FOUND");
    if (setup.expiresAt < new Date()) throw new Error("OTP_EXPIRED");
    if (setup.otp !== otp) throw new Error("INVALID_OTP");

    // Mark as verified — use otp field as reset token
    const resetToken = Math.random().toString(36).slice(2) + Date.now();
    await db.ownerSetup.update({
      where: { email },
      data: { verified: true, otp: resetToken },
    });

    return { resetToken };
  },

  resetPassword: async (
    email: string,
    resetToken: string,
    newPassword: string,
  ) => {
    const setup = await db.ownerSetup.findUnique({ where: { email } });
    if (!setup || !setup.verified || setup.otp !== resetToken) {
      throw new Error("INVALID_TOKEN");
    }
    if (setup.expiresAt < new Date()) throw new Error("TOKEN_EXPIRED");

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { email }, data: { password: hashed } });
    await db.ownerSetup.delete({ where: { email } });

    return { message: "Password reset" };
  },

  sendChangePasswordOTP: async (userId: string) => {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("NOT_FOUND");
    if (!user.email) throw new Error("NO_EMAIL");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.ownerSetup.upsert({
      where: { email: user.email },
      update: { otp, verified: false, expiresAt },
      create: { email: user.email, otp, verified: false, expiresAt },
    });

    await emailService.sendOTP(user.email, otp, "change");
    return { email: user.email };
  },

  changePassword: async (userId: string, otp: string, newPassword: string) => {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) throw new Error("NOT_FOUND");

    const setup = await db.ownerSetup.findUnique({
      where: { email: user.email },
    });
    if (!setup) throw new Error("OTP_NOT_FOUND");
    if (setup.expiresAt < new Date()) throw new Error("OTP_EXPIRED");
    if (setup.otp !== otp) throw new Error("INVALID_OTP");

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { id: userId }, data: { password: hashed } });
    await db.ownerSetup.delete({ where: { email: user.email } });

    return { message: "Password changed" };
  },
};
