import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid("Invalid booking ID"),
  }),
});