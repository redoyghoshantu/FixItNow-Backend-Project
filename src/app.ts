import express from "express";
import cors from "cors";
import { AuthRoutes } from "./modules/auth/auth.routes.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { CategoryRoutes } from "./modules/category/category.routes.js";
import { ServiceRoutes } from "./modules/service/service.routes.js";
import { technicianRoutes } from "./modules/technician/technician.routes.js";





const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "FixItNow API is running" });
});

app.use("/api/auth", AuthRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/services", ServiceRoutes);
app.use("/api/technicians", technicianRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;