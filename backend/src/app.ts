import express from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env";
import { prisma } from "./config/database";
import healthRouter from "./routes/health.routes";
import userRouter from "./routes/user.routes";
import documentRouter from "./routes/document.routes";
import chatRouter from "./routes/chat.routes";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/documents", documentRouter);
app.use("/api/v1/chat", chatRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

async function startServer() {
  try {
    await prisma.$connect();

    console.log("Database connected");

    app.listen(env.PORT, () => {
      console.log(`Backend running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);

    await prisma.$disconnect();

    process.exit(1);
  }
}

startServer();
