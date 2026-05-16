import { db } from "../utils/db";

export const userRepo = {
  findAll: () => {
    return db.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
  },

  findById: (id: string) => {
    return db.user.findUnique({
      where: { id },
    });
  },

  findOwner: () => {
    return db.user.findFirst({
      where: { role: "owner" },
    });
  },

  create: (data: {
    name: string;
    email?: string;
    password: string;
    role: string;
  }) => {
    return db.user.create({ data });
  },

  ownerExists: async () => {
    const owner = await db.user.findFirst({
      where: { role: "owner" },
    });
    return !!owner;
  },
};
