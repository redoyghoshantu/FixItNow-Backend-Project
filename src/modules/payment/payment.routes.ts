import { Router } from "express";
import { PaymentControllers } from "./payment.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createPaymentSchema } from "./payment.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.post(
  "/create",
  auth("CUSTOMER"),
  validateRequest(createPaymentSchema),
  PaymentControllers.createPayment
);
router.get("/", auth("CUSTOMER"), PaymentControllers.getMyPayments);
router.get("/:id", auth("CUSTOMER"), PaymentControllers.getPaymentById);
router.post("/confirm", auth("CUSTOMER"), PaymentControllers.confirmPayment);
export const PaymentRoutes = router;