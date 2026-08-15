import { Router } from "express";
import { AdminControllers } from "./admin.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { updateUserStatusSchema } from "./admin.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.get("/users", auth("ADMIN"), AdminControllers.getAllUsers);
router.patch(
  "/users/:id",
  auth("ADMIN"),
  validateRequest(updateUserStatusSchema),
  AdminControllers.updateUserStatus
);
router.get("/bookings", auth("ADMIN"), AdminControllers.getAllBookings);

export const AdminRoutes = router;