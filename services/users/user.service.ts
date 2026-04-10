import { db } from "@/lib/db";
import type { UserProfileInput, UserPreferenceInput } from "@/domain/user/schemas";
import type { UserProfile, UserPreference } from "@prisma/client";

export class UserService {
  async upsertProfile(
    userId: string,
    input: UserProfileInput
  ): Promise<UserProfile> {
    return db.userProfile.upsert({
      where: { userId },
      create: { userId, ...input },
      update: input,
    });
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return db.userProfile.findUnique({ where: { userId } });
  }

  async upsertPreferences(
    userId: string,
    input: UserPreferenceInput
  ): Promise<UserPreference> {
    return db.userPreference.upsert({
      where: { userId },
      create: { userId, ...input },
      update: input,
    });
  }

  async getPreferences(userId: string): Promise<UserPreference | null> {
    return db.userPreference.findUnique({ where: { userId } });
  }
}

export const userService = new UserService();
