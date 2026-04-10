import type { User, UserProfile, UserPreference } from "@prisma/client";

export type SafeUser = Omit<User, "passwordHash">;

export type UserWithProfile = SafeUser & {
  profile: UserProfile | null;
  preferences: UserPreference | null;
};
