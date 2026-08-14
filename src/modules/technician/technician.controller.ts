import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { TechnicianServices } from "./technician.service.js";

const updateProfile = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const profile = await TechnicianServices.updateProfile(userId, req.body);
  sendResponse(res, 200, "Technician profile updated successfully", profile);
});

const updateAvailability = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const availability = await TechnicianServices.updateAvailability(userId, req.body.slots);
  sendResponse(res, 200, "Availability updated successfully", availability);
});

const getAllTechnicians = catchAsync(async (req, res) => {
  const technicians = await TechnicianServices.getAllTechnicians();
  sendResponse(res, 200, "Technicians retrieved successfully", technicians);
});

const getTechnicianById = catchAsync(async (req, res) => {
  const technician = await TechnicianServices.getTechnicianById(req.params.id as string);
  sendResponse(res, 200, "Technician retrieved successfully", technician);
});

export const technicianControllers = { updateProfile, updateAvailability, getAllTechnicians, getTechnicianById };