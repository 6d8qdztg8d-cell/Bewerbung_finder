"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { userProfileSchema, type UserProfileInput } from "@/domain/user/schemas";
import type { UserProfile } from "@prisma/client";

export function ProfileForm({ defaultValues }: { defaultValues: UserProfile | null }) {
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileInput>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      phone: defaultValues?.phone ?? "",
      location: defaultValues?.location ?? "",
      linkedinUrl: defaultValues?.linkedinUrl ?? "",
      githubUrl: defaultValues?.githubUrl ?? "",
      portfolioUrl: defaultValues?.portfolioUrl ?? "",
      summary: defaultValues?.summary ?? "",
      skills: defaultValues?.skills ?? [],
      languages: defaultValues?.languages ?? [],
    },
  });

  const onSubmit = async (data: UserProfileInput) => {
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">Vorname</label>
          <input {...register("firstName")} placeholder="Max"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.firstName && <p className="text-red-400 text-xs">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">Nachname</label>
          <input {...register("lastName")} placeholder="Mustermann"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.lastName && <p className="text-red-400 text-xs">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-300">Telefon</label>
        <input {...register("phone")} placeholder="+49 123 456789"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-300">Standort</label>
        <input {...register("location")} placeholder="Berlin, Deutschland"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-300">LinkedIn URL</label>
        <input {...register("linkedinUrl")} placeholder="https://linkedin.com/in/..."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.linkedinUrl && <p className="text-red-400 text-xs">{errors.linkedinUrl.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-300">GitHub URL</label>
        <input {...register("githubUrl")} placeholder="https://github.com/..."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-300">Zusammenfassung</label>
        <textarea {...register("summary")} rows={3} placeholder="Kurze professionelle Zusammenfassung…"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <button type="submit" disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
        {isSubmitting ? "Speichert…" : saved ? "Gespeichert ✓" : "Profil speichern"}
      </button>
    </form>
  );
}
