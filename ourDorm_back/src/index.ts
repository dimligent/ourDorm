/// <reference path="../worker-configuration.d.ts" />
import { Hono } from "hono";
import { cors } from "hono/cors";
import authRouter from "./routes/auth";
import membersRouter from "./routes/members";
import flagsRouter from "./routes/flags";
import countdownRouter from "./routes/countdown";
import logsRouter from "./routes/logs";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (!origin) return undefined;

      const allowed = [
        /^https:\/\/ourdorm\.pages\.dev$/,
        /^https:\/\/[a-z0-9-]+\.ourdorm\.pages\.dev$/, // preview: 8c85be46.ourdorm.pages.dev
        /^https:\/\/ourdorm\.chai\.qzz\.io$/,
        /^http:\/\/localhost:\d+$/, // local dev
      ];

      return allowed.some((re) => re.test(origin)) ? origin : undefined;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (c) => {
  return c.json({
    code: "200",
    message: "723宿舍官网API服务已启动",
    version: "1.0.0",
  });
});

app.route("/auth", authRouter);
app.route("/members", membersRouter);
app.route("/flags", flagsRouter);
app.route("/countdown", countdownRouter);
app.route("/logs", logsRouter);

export default app;

