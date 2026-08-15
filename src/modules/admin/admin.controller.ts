import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AdminServices } from "./admin.service.js";

const getAllUsers = catchAsync(async (req, res) => {
  const users = await AdminServices.getAllUsers();
  sendResponse(res, 200, "Users retrieved successfully", users);
});

const updateUserStatus = catchAsync(async (req, res) => {
  const user = await AdminServices.updateUserStatus(
    req.params.id as string,
    req.body.status
  );
  sendResponse(res, 200, "User status updated successfully", user);
});

const getAllBookings = catchAsync(async (req, res) => {
  const bookings = await AdminServices.getAllBookings();
  sendResponse(res, 200, "Bookings retrieved successfully", bookings);
});

export const AdminControllers = { getAllUsers, updateUserStatus, getAllBookings };