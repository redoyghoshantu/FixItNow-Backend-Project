import { Router } from "express";
import { CategoryControllers } from "./category.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createCategorySchema } from "./category.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.get("/", CategoryControllers.getAllCategories); 
router.post(
  "/",
  auth("ADMIN"),
  validateRequest(createCategorySchema),
  CategoryControllers.createCategory
);

export const CategoryRoutes = router;