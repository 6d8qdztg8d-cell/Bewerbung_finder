import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { RegisterInput } from "@/domain/user/schemas";
import type { SafeUser } from "@/domain/user/types";

const SALT_ROUNDS = 12;

export class AuthService {
  async register(input: RegisterInput): Promise<SafeUser> {
    const existing = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await db.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async getUserById(id: string): Promise<SafeUser | null> {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async getUserByEmail(email: string): Promise<SafeUser | null> {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();
