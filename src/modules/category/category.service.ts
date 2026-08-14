import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

const createCategory = async (payload: { name: string; description?: string }) => {
  const existing = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (existing) {
    throw new AppError(409, "Category with this name already exists");
  }

  return prisma.category.create({ data: payload });
};

const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

export const CategoryServices = { createCategory, getAllCategories };