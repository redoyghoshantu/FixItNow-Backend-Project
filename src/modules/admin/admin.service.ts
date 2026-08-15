import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateUserStatus = async (userId: string, status: "ACTIVE" | "BANNED") => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.role === "ADMIN") {
    throw new AppError(403, "Cannot change status of an Admin account");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, email: true, status: true },
  });
};

const getAllBookings = async () => {
  return prisma.booking.findMany({
    include: {
      customer: { select: { name: true, email: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
      service: { select: { title: true, price: true } },
      payment: { select: { status: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const AdminServices = { getAllUsers, updateUserStatus, getAllBookings };