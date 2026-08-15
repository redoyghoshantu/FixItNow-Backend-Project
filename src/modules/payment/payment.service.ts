import prisma from "../../config/db.js";
import stripe from "../../config/stripe.js";
import { AppError } from "../../utils/AppError.js";
import Stripe from "stripe";

const createCheckoutSession = async (customerId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, payment: true },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  if (booking.customerId !== customerId) {
    throw new AppError(403, "This booking does not belong to you");
  }

  if (booking.status !== "ACCEPTED") {
    throw new AppError(
      400,
      `Cannot pay for a booking with status ${booking.status}. Booking must be ACCEPTED first.`
    );
  }

  if (booking.payment) {
    throw new AppError(409, "Payment already exists for this booking");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: booking.service.title },
          unit_amount: Math.round(booking.service.price * 100), 
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_CANCEL_URL}`,
    metadata: { bookingId: booking.id }, 
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: booking.service.price,
      provider: "STRIPE",
      status: "PENDING",
      stripeSessionId: session.id,
    },
  });

  return { checkoutUrl: session.url };
};


const handlePaymentSuccess = async (session: Stripe.Checkout.Session) => {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) return;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { stripeSessionId: session.id },
      data: {
        status: "COMPLETED",
        transactionId: session.payment_intent as string,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "PAID" },
    });
  });
};

const getMyPayments = async (customerId: string) => {
  return prisma.payment.findMany({
    where: { booking: { customerId } },
    include: {
      booking: { include: { service: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentById = async (id: string, customerId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { booking: { include: { service: true } } },
  });

  if (!payment) throw new AppError(404, "Payment not found");
  if (payment.booking.customerId !== customerId) {
    throw new AppError(403, "You do not have permission to view this payment");
  }

  return payment;
};

const confirmPayment = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new AppError(400, `Payment not completed. Status: ${session.payment_status}`);
  }

  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: sessionId },
  });

  if (!payment) {
    throw new AppError(404, "Payment record not found");
  }

  if (payment.status === "COMPLETED") {
    return payment; 
  }

  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    throw new AppError(400, "Booking reference missing in session metadata");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { stripeSessionId: sessionId },
      data: {
        status: "COMPLETED",
        transactionId: session.payment_intent as string,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "PAID" },
    });

    return updatedPayment;
  });

  return result;
};

export const PaymentServices = {
  createCheckoutSession,
  handlePaymentSuccess,
  getMyPayments,
  getPaymentById,
  confirmPayment
};