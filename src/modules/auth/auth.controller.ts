import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AuthServices } from "./auth.service.js";

const register = catchAsync(async (req, res) => {
  const user = await AuthServices.registerUser(req.body);
  sendResponse(res, 201, "User registered successfully", user);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthServices.loginUser(email, password);
  sendResponse(res, 200, "Login successful", result);
});

const getMe = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const user = await AuthServices.getMe(userId);
  sendResponse(res, 200, "User profile retrieved", user);
});

export const AuthControllers = { register, login, getMe };