import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { Prisma } from "../../generated/prisma/client.js";

interface CreateServiceInput {
  categoryId: string;
  title: string;
  description?: string;
  price: number;
}

const createService = async (userId: string, payload: CreateServiceInput) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new AppError(404, "Technician profile not found");
  }

  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  return prisma.service.create({
    data: {
      technicianProfileId: technicianProfile.id,
      categoryId: payload.categoryId,
      title: payload.title,
      description: payload.description,
      price: payload.price,
    },
    include: {
      category: true,
      technicianProfile: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });
};

interface ServiceFilters {
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  searchTerm?: string;
}

const getAllServices = async (filters: ServiceFilters) => {
  const where: Prisma.ServiceWhereInput = {};

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice && { gte: Number(filters.minPrice) }),
      ...(filters.maxPrice && { lte: Number(filters.maxPrice) }),
    };
  }

  if (filters.searchTerm) {
    where.title = { contains: filters.searchTerm, mode: "insensitive" };
  }

  return prisma.service.findMany({
    where,
    include: {
      category: true,
      technicianProfile: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getServiceById = async (id: string) => {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      category: true,
      technicianProfile: {
        include: { user: { select: { name: true, email: true, phone: true } } },
      },
    },
  });

  if (!service) {
    throw new AppError(404, "Service not found");
  }

  return service;
};

export const ServiceServices = { createService, getAllServices, getServiceById };