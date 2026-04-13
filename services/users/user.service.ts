import { db } from "@/lib/db";
import type { UserProfileInput, UserPreferenceInput, ApiKeysInput } from "@/domain/user/schemas";
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

  async upsertApiKeys(userId: string, input: ApiKeysInput): Promise<void> {
    const data: Record<string, string | undefined> = {};
    if (input.openaiApiKey !== undefined) data.openaiApiKey = input.openaiApiKey || undefined;
    if (input.rapidApiKey !== undefined) data.rapidApiKey = input.rapidApiKey || undefined;

    await db.userProfile.upsert({
      where: { userId },
      create: { userId, firstName: "", lastName: "", ...data },
      update: data,
    });
  }

  async getApiKeys(userId: string): Promise<{ openaiApiKey: string | null; rapidApiKey: string | null }> {
    const profile = await db.userProfile.findUnique({
      where: { userId },
      select: { openaiApiKey: true, rapidApiKey: true },
    });
    return {
      openaiApiKey: profile?.openaiApiKey ?? null,
      rapidApiKey: profile?.rapidApiKey ?? null,
    };
  }

  async getOpenAIKey(userId: string): Promise<string | null> {
    const profile = await db.userProfile.findUnique({
      where: { userId },
      select: { openaiApiKey: true },
    });
    return profile?.openaiApiKey ?? null;
  }
}

export const userService = new UserService();
