import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { CategoryServices } from "./category.service.js";

const createCategory = catchAsync(async (req, res) => {
  const category = await CategoryServices.createCategory(req.body);
  sendResponse(res, 201, "Category created successfully", category);
});

const getAllCategories = catchAsync(async (req, res) => {
  const categories = await CategoryServices.getAllCategories();
  sendResponse(res, 200, "Categories retrieved successfully", categories);
});

export const CategoryControllers = { createCategory, getAllCategories };