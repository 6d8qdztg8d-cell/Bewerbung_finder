import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = loginSchema
  .extend({
    name: z.string().min(2, "Name must be at least 2 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const userProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  summary: z.string().max(2000).optional(),
  skills: z.array(z.string()),
  languages: z.array(z.string()),
});

export const userPreferenceSchema = z.object({
  jobTitles: z.array(z.string()),
  industries: z.array(z.string()),
  locations: z.array(z.string()),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  currency: z.string().default("EUR"),
  jobTypes: z.array(z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE", "INTERNSHIP"])),
  workModes: z.array(z.enum(["REMOTE", "HYBRID", "ONSITE"])),
  minMatchScore: z.number().min(0).max(100).default(70),
  maxApplicationsPerDay: z.number().min(1).max(50).default(5),
  autoApply: z.boolean().default(false),
  blacklistedCompanies: z.array(z.string()),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UserPreferenceInput = z.infer<typeof userPreferenceSchema>;
