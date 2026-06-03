import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import http from "node:http";
import { Server } from "socket.io";
import { AnalysisQueue } from "./lib/queue";
import { createRoutes } from "./routes";
import { getJob } from "./lib/store";

dotenv.config();

export function createApp() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173"
    }
  });
  const queue = new AnalysisQueue(Number(process.env.JOB_CONCURRENCY ?? 2));
  const maxUploadBytes = Number(process.env.MAX_UPLOAD_MB ?? 20) * 1024 * 1024;

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json({ limit: "2mb" }));
  app.use(rateLimit({ windowMs: 60_000, limit: 30 }));

  io.on("connection", (socket) => {
    socket.on("subscribe", (jobId: string) => {
      socket.join(jobId);
      const existing = getJob(jobId);
      if (existing) {
        socket.emit("job:update", existing);
      }
    });
  });

  const emitJobUpdate = (job: NonNullable<ReturnType<typeof getJob>>) => {
    io.to(job.id).emit("job:update", job);
  };

  app.use(
    "/api",
    createRoutes({
      emitJobUpdate,
      queue,
      maxUploadBytes
    })
  );

  app.get("/", (_req, res) => {
    res.json({ name: "Academic Integrity Hub API", status: "ok" });
  });

  return { app, server, io, queue };
}
