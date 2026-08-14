import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

interface UpdateProfileInput {
  bio?: string;
  experienceYears?: number;
  hourlyRate?: number;
}

const updateProfile = async (userId: string, payload: UpdateProfileInput) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });

  if (!profile) {
    throw new AppError(404, "Technician profile not found");
  }

  return prisma.technicianProfile.update({
    where: { userId },
    data: payload,
  });
};

interface SlotInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const updateAvailability = async (userId: string, slots: SlotInput[]) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });

  if (!profile) {
    throw new AppError(404, "Technician profile not found");
  }

  // Replace strategy: transaction এ পুরনো সব মুছে নতুন বসানো
  const result = await prisma.$transaction(async (tx) => {
    await tx.availabilitySlot.deleteMany({
      where: { technicianProfileId: profile.id },
    });

    await tx.availabilitySlot.createMany({
      data: slots.map((slot) => ({
        technicianProfileId: profile.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    });

    return tx.availabilitySlot.findMany({
      where: { technicianProfileId: profile.id },
      orderBy: { dayOfWeek: "asc" },
    });
  });

  return result;
};

const getAllTechnicians = async () => {
  return prisma.technicianProfile.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      services: { include: { category: true } },
    },
    orderBy: { avgRating: "desc" },
  });
};

const getTechnicianById = async (id: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      services: { include: { category: true } },
      availabilitySlots: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!technician) {
    throw new AppError(404, "Technician not found");
  }

  return technician;
};

export const TechnicianServices = {
  updateProfile,
  updateAvailability,
  getAllTechnicians,
  getTechnicianById,
};