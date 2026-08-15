import { Router } from "express";
import { ReviewControllers } from "./review.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createReviewSchema } from "./review.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(createReviewSchema),
  ReviewControllers.createReview
);
router.get("/technician/:technicianId", ReviewControllers.getTechnicianReviews); // Public

export const ReviewRoutes = router;