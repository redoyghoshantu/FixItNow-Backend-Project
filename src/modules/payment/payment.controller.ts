import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { PaymentServices } from "./payment.service.js";
import stripe from "../../config/stripe.js";
import Stripe from "stripe";

const createPayment = catchAsync(async (req, res) => {
  const customerId = req.user!.userId;
  const result = await PaymentServices.createCheckoutSession(
    customerId,
    req.body.bookingId
  );
  sendResponse(res, 201, "Checkout session created", result);
});


const handleWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await PaymentServices.handlePaymentSuccess(session);
  }

  res.status(200).json({ received: true });
};

const getMyPayments = catchAsync(async (req, res) => {
  const customerId = req.user!.userId;
  const payments = await PaymentServices.getMyPayments(customerId);
  sendResponse(res, 200, "Payments retrieved successfully", payments);
});

const getPaymentById = catchAsync(async (req, res) => {
  const customerId = req.user!.userId;
  const payment = await PaymentServices.getPaymentById(
    req.params.id as string,
    customerId
  );
  sendResponse(res, 200, "Payment retrieved successfully", payment);
});

const confirmPayment = catchAsync(async (req, res) => {
  const payment = await PaymentServices.confirmPayment(req.body.sessionId);
  sendResponse(res, 200, "Payment confirmed successfully", payment);
});

export const PaymentControllers = {
  createPayment,
  handleWebhook,
  getMyPayments,
  getPaymentById,
  confirmPayment
};