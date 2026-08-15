import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { ReviewServices } from "./review.service.js";

const createReview = catchAsync(async (req, res) => {
  const customerId = req.user!.userId;
  const review = await ReviewServices.createReview(customerId, req.body);
  sendResponse(res, 201, "Review submitted successfully", review);
});

const getTechnicianReviews = catchAsync(async (req, res) => {
  const reviews = await ReviewServices.getTechnicianReviews(
    req.params.technicianId as string
  );
  sendResponse(res, 200, "Reviews retrieved successfully", reviews);
});

export const ReviewControllers = { createReview, getTechnicianReviews };