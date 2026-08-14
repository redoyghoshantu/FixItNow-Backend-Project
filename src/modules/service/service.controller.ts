import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { ServiceServices } from "./service.service.js";

const createService = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const service = await ServiceServices.createService(userId, req.body);
  sendResponse(res, 201, "Service created successfully", service);
});

const getAllServices = catchAsync(async (req, res) => {
  const services = await ServiceServices.getAllServices(req.query);
  sendResponse(res, 200, "Services retrieved successfully", services);
});

const getServiceById = catchAsync(async (req, res) => {
  const service = await ServiceServices.getServiceById(req.params.id as string);
  sendResponse(res, 200, "Service retrieved successfully", service);
});

export const ServiceControllers = { createService, getAllServices, getServiceById };