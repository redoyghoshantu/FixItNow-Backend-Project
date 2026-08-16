import "dotenv/config";
import { Server } from "http";
import app from "./app.js";
import prisma from "./config/db.js";

const PORT = process.env.PORT || 5000;
let server: Server;

async function main() {
  try {
    await prisma.$connect();
    console.log(" Database connected");

    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
}

main();

process.on("unhandledRejection", (reason) => {
  console.error(" Unhandled Rejection detected:", reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.error(" Uncaught Exception detected:", error);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log(" SIGTERM received, shutting down gracefully");
  if (server) {
    server.close(() => {
      console.log("Process terminated");
    });
  }
});