import { Router } from "express";
import { BookingControllers } from "./booking.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from "./booking.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

// Customer routes
router.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(createBookingSchema),
  BookingControllers.createBooking
);
router.get("/", auth("CUSTOMER"), BookingControllers.getMyBookings);
router.patch("/:id/cancel", auth("CUSTOMER"), BookingControllers.cancelBooking);

// Shared (any logged-in user can view a single booking — ownership checked inside service later if needed)
router.get("/:id", auth(), BookingControllers.getBookingById);

// Technician routes
router.get(
  "/technician/all",
  auth("TECHNICIAN"),
  BookingControllers.getTechnicianBookings
);
router.patch(
  "/technician/:id/status",
  auth("TECHNICIAN"),
  validateRequest(updateBookingStatusSchema),
  BookingControllers.updateBookingStatus
);

export const BookingRoutes = router;