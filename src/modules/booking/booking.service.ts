
import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { BOOKING_STATUS_TRANSITIONS } from "./booking.constant.js";

interface CreateBookingInput {
  serviceId: string;
  scheduledAt: string;
  address: string;
  notes?: string;
}

const createBooking = async (customerId: string, payload: CreateBookingInput) => {
  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
  });

  if (!service) {
    throw new AppError(404, "Service not found");
  }

  return prisma.booking.create({
    data: {
      customerId,
      technicianProfileId: service.technicianProfileId, // derived, client পাঠায়নি
      serviceId: payload.serviceId,
      scheduledAt: new Date(payload.scheduledAt),
      address: payload.address,
      notes: payload.notes,
      status: "REQUESTED", // hardcoded, client override করতে পারবে না
    },
    include: {
      service: { include: { category: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
    },
  });
};

const getMyBookings = async (customerId: string) => {
  return prisma.booking.findMany({
    where: { customerId },
    include: {
      service: { include: { category: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getTechnicianBookings = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError(404, "Technician profile not found");

  return prisma.booking.findMany({
    where: { technicianProfileId: profile.id },
    include: {
      service: true,
      customer: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getBookingById = async (
  bookingId: string,
  requester: { userId: string; role: string }
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { include: { category: true } },
      technicianProfile: { include: { user: { select: { name: true } } } },
      customer: { select: { name: true, phone: true } },
      payment: true,
    },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  // Ownership check — Admin সব দেখতে পারবে, বাকিরা শুধু নিজেরটা
  if (requester.role === "ADMIN") {
    return booking;
  }

  if (requester.role === "CUSTOMER" && booking.customerId === requester.userId) {
    return booking;
  }

  if (requester.role === "TECHNICIAN") {
    const profile = await prisma.technicianProfile.findUnique({
      where: { userId: requester.userId },
    });
    if (profile && booking.technicianProfileId === profile.id) {
      return booking;
    }
  }

  throw new AppError(403, "You do not have permission to view this booking");
};

// Technician: accept/decline/start/complete
const updateBookingStatus = async (
  userId: string,
  bookingId: string,
  newStatus: string
) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError(404, "Technician profile not found");

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError(404, "Booking not found");

  if (booking.technicianProfileId !== profile.id) {
    throw new AppError(403, "This booking does not belong to you");
  }

  const allowedNextStates = BOOKING_STATUS_TRANSITIONS[booking.status];
  if (!allowedNextStates.includes(newStatus)) {
    throw new AppError(
      400,
      `Cannot change status from ${booking.status} to ${newStatus}`
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: newStatus as any },
  });
};

// Customer: cancel
const cancelBooking = async (customerId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError(404, "Booking not found");

  if (booking.customerId !== customerId) {
    throw new AppError(403, "This booking does not belong to you");
  }

  const allowedNextStates = BOOKING_STATUS_TRANSITIONS[booking.status];
  if (!allowedNextStates.includes("CANCELLED")) {
    throw new AppError(
      400,
      `Cannot cancel a booking that is already ${booking.status}`
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
};

export const BookingServices = {
  createBooking,
  getMyBookings,
  getTechnicianBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};