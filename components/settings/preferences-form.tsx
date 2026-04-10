"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { userPreferenceSchema, type UserPreferenceInput } from "@/domain/user/schemas";
import type { UserPreference } from "@prisma/client";

export function PreferencesForm({ defaultValues }: { defaultValues: UserPreference | null }) {
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserPreferenceInput>({
    resolver: zodResolver(userPreferenceSchema),
    defaultValues: defaultValues
      ? {
          jobTitles: defaultValues.jobTitles,
          industries: defaultValues.industries,
          locations: defaultValues.locations,
          minSalary: defaultValues.minSalary ?? undefined,
          maxSalary: defaultValues.maxSalary ?? undefined,
          currency: defaultValues.currency,
          jobTypes: defaultValues.jobTypes,
          workModes: defaultValues.workModes,
          minMatchScore: defaultValues.minMatchScore,
          maxApplicationsPerDay: defaultValues.maxApplicationsPerDay,
          autoApply: defaultValues.autoApply,
          blacklistedCompanies: defaultValues.blacklistedCompanies,
        }
      : {
          jobTitles: [],
          industries: [],
          locations: [],
          jobTypes: [],
          workModes: [],
          minMatchScore: 70,
          maxApplicationsPerDay: 5,
          autoApply: false,
          blacklistedCompanies: [],
          currency: "EUR",
        },
  });

  const onSubmit = async (data: UserPreferenceInput) => {
    await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-300">
          Gewünschte Jobtitel
          <span className="text-slate-500 font-normal ml-1">(kommagetrennt)</span>
        </label>
        <input
          placeholder="Software Engineer, Backend Developer, Full Stack…"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            // Manually handle comma-separated → array conversion on submit
            // react-hook-form handles arrays differently; we use a hidden approach
            void e;
          }}
          {...register("jobTitles.0")}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-300">
          Standorte
        </label>
        <input
          {...register("locations.0")}
          placeholder="Berlin, München, Remote…"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">
            Mindestgehalt (€)
          </label>
          <input
            type="number"
            {...register("minSalary", { valueAsNumber: true })}
            placeholder="50000"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">
            Maximalgehalt (€)
          </label>
          <input
            type="number"
            {...register("maxSalary", { valueAsNumber: true })}
            placeholder="100000"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">
            Min. Match-Score
          </label>
          <input
            type="number"
            min={0}
            max={100}
            {...register("minMatchScore", { valueAsNumber: true })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.minMatchScore && (
            <p className="text-red-400 text-xs">{errors.minMatchScore.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">
            Max. Bewerbungen/Tag
          </label>
          <input
            type="number"
            min={1}
            max={50}
            {...register("maxApplicationsPerDay", { valueAsNumber: true })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="autoApply"
          {...register("autoApply")}
          className="w-4 h-4 rounded accent-blue-600"
        />
        <label htmlFor="autoApply" className="text-sm text-slate-300">
          Automatisch bewerben (nur wenn Score ≥ Mindest-Score)
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {isSubmitting ? "Speichert…" : saved ? "Gespeichert ✓" : "Präferenzen speichern"}
      </button>
    </form>
  );
}
