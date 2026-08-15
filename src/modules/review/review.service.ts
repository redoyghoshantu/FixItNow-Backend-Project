import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment?: string;
}

const createReview = async (customerId: string, payload: CreateReviewInput) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { review: true },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  if (booking.customerId !== customerId) {
    throw new AppError(403, "This booking does not belong to you");
  }

  if (booking.status !== "COMPLETED") {
    throw new AppError(
      400,
      `Cannot review a booking with status ${booking.status}. Booking must be COMPLETED first.`
    );
  }

  if (booking.review) {
    throw new AppError(409, "You have already reviewed this booking");
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        bookingId: payload.bookingId,
        customerId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const aggregate = await tx.review.aggregate({
      where: {
        booking: { technicianProfileId: booking.technicianProfileId },
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.technicianProfile.update({
      where: { id: booking.technicianProfileId },
      data: {
        avgRating: aggregate._avg.rating ?? 0,
        totalReviews: aggregate._count.rating,
      },
    });

    return review;
  });

  return result;
};

const getTechnicianReviews = async (technicianProfileId: string) => {
  return prisma.review.findMany({
    where: {
      booking: { technicianProfileId },
    },
    include: {
      customer: { select: { name: true } },
      booking: { select: { service: { select: { title: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const ReviewServices = { createReview, getTechnicianReviews };