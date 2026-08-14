import { z } from "zod";

export const createServiceSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid("Invalid category ID"),
    title: z.string().min(2, "Title is required"),
    description: z.string().optional(),
    price: z.number().positive("Price must be a positive number"),
  }),
});

export const getServicesQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().uuid().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    searchTerm: z.string().optional(),
  }),
});