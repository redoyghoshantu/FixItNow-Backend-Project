import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    experienceYears: z.number().int().min(0).optional(),
    hourlyRate: z.number().positive().optional(),
  }),
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    slots: z
      .array(
        z.object({
          dayOfWeek: z.number().int().min(0).max(6), // 0=Sunday ... 6=Saturday
          startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm format"),
          endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm format"),
        })
      )
      .min(1, "At least one availability slot is required"),
  }),
});