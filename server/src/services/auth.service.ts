import bcrypt from "bcryptjs";
import { userRepo } from "../repositories/user.repo";
import { signToken } from "../utils/jwt";

export const authService = {
  getSetupStatus: async () => {
    const exists = await userRepo.ownerExists();
    return { ownerExists: exists };
  },

  getAccounts: async () => {
    return userRepo.findAll();
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const ownerExists = await userRepo.ownerExists();
    if (ownerExists) {
      throw new Error("OWNER_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await userRepo.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "owner",
    });

    const token = signToken({ userId: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  },

  login: async (data: { userId: string; password: string }) => {
    const user = await userRepo.findById(data.userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    if (!user.isActive) throw new Error("ACCOUNT_DISABLED");

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new Error("INVALID_PASSWORD");

    const token = signToken({ userId: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  },
};
