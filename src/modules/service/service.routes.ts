import { Router } from "express";
import { ServiceControllers } from "./service.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createServiceSchema } from "./service.validation.js";
import { auth } from "../../middlewares/auth.js";
import { idParamSchema } from "../../utils/idParamSchema.js";

const router = Router();

router.get("/", ServiceControllers.getAllServices); // Public + filters
router.get("/:id",validateRequest(idParamSchema), ServiceControllers.getServiceById); // Public
router.post(
  "/",
  auth("TECHNICIAN"),
  validateRequest(createServiceSchema),
  ServiceControllers.createService
);

export const ServiceRoutes = router;