import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().uuid("Invalid service ID"),
    scheduledAt: z.string().datetime("Invalid date format"),
    address: z.string().min(5, "Address is required"),
    notes: z.string().optional(),
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"]),
  }),
});