import { Router } from "express";
import { technicianControllers } from "./technician.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { updateProfileSchema, updateAvailabilitySchema } from "./technician.validation.js";
import { auth } from "../../middlewares/auth.js";
import { idParamSchema } from "../../utils/idParamSchema.js";

const router = Router();

router.get("/", technicianControllers.getAllTechnicians); 
router.get("/:id", validateRequest(idParamSchema),technicianControllers.getTechnicianById); // Public

router.put(
  "/profile",
  auth("TECHNICIAN"),
  validateRequest(updateProfileSchema),
  technicianControllers.updateProfile
);
router.put(
  "/availability",
  auth("TECHNICIAN"),
  validateRequest(updateAvailabilitySchema),
  technicianControllers.updateAvailability
);

export const technicianRoutes = router;