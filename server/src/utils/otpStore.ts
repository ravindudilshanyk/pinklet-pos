interface OTPEntry {
  otp: string;
  email: string;
  purpose: string;
  expiresAt: Date;
  attempts: number;
}

// In-memory OTP store (resets on server restart — fine for POS)
const store = new Map<string, OTPEntry>();

export const otpStore = {
  generate: (email: string, purpose: string): string => {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Use email+purpose as key
    const key = `${email}:${purpose}`;
    store.set(key, { otp, email, purpose, expiresAt, attempts: 0 });

    return otp;
  },

  verify: (email: string, purpose: string, otp: string): boolean => {
    const key = `${email}:${purpose}`;
    const entry = store.get(key);

    if (!entry) return false;
    if (entry.expiresAt < new Date()) {
      store.delete(key);
      return false;
    }

    entry.attempts += 1;

    if (entry.attempts > 5) {
      store.delete(key);
      return false;
    }

    if (entry.otp !== otp) return false;

    store.delete(key); // OTP used — remove it
    return true;
  },

  cleanup: () => {
    const now = new Date();
    store.forEach((entry, key) => {
      if (entry.expiresAt < now) store.delete(key);
    });
  },
};

// Clean up expired OTPs every 15 minutes
setInterval(otpStore.cleanup, 15 * 60 * 1000);
