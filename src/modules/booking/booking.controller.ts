import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { BookingServices } from "./booking.service.js";

const createBooking = catchAsync(async (req, res) => {
  const customerId = req.user!.userId;
  const booking = await BookingServices.createBooking(customerId, req.body);
  sendResponse(
    res,
    201,
    "Booking created successfully. Waiting for technician response.",
    booking
  );
});

const getMyBookings = catchAsync(async (req, res) => {
  const customerId = req.user!.userId;
  const bookings = await BookingServices.getMyBookings(customerId);
  sendResponse(res, 200, "Bookings retrieved successfully", bookings);
});

const getTechnicianBookings = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const bookings = await BookingServices.getTechnicianBookings(userId);
  sendResponse(res, 200, "Bookings retrieved successfully", bookings);
});

const getBookingById = catchAsync(async (req, res) => {
  const booking = await BookingServices.getBookingById(req.params.id as string, {
    userId: req.user!.userId,
    role: req.user!.role,
  });
  sendResponse(res, 200, "Booking retrieved successfully", booking);
});

const updateBookingStatus = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const booking = await BookingServices.updateBookingStatus(
    userId,
    req.params.id as string,
    req.body.status
  );
  sendResponse(
    res,
    200,
    `Booking status updated to ${req.body.status}`,
    booking
  );
});

const cancelBooking = catchAsync(async (req, res) => {
  const customerId = req.user!.userId;
  const booking = await BookingServices.cancelBooking(
    customerId,
    req.params.id as string
  );
  sendResponse(res, 200, "Booking cancelled successfully", booking);
});

export const BookingControllers = {
  createBooking,
  getMyBookings,
  getTechnicianBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};