import { Router } from "express";
import { BookingControllers } from "./booking.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from "./booking.validation.js";
import { auth } from "../../middlewares/auth.js";
import { idParamSchema } from "../../utils/idParamSchema.js";

const router = Router();

// Customer routes
router.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(createBookingSchema),
  BookingControllers.createBooking
);
router.get("/", auth("CUSTOMER"), BookingControllers.getMyBookings);
router.patch("/:id/cancel", validateRequest(idParamSchema), auth("CUSTOMER"), BookingControllers.cancelBooking);

router.get("/:id", validateRequest(idParamSchema),  auth(), BookingControllers.getBookingById);

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