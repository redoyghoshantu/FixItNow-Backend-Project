import { Router } from "express";
import { AuthControllers } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  AuthControllers.register
);
router.post("/login", validateRequest(loginSchema), AuthControllers.login);
router.get("/me", auth(), AuthControllers.getMe);

export const AuthRoutes = router;