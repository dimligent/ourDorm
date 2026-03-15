import { Hono } from "hono";
import { cors } from "hono/cors";
import authRouter from "./routes/local-auth";
import membersRouter from "./routes/local-members";
import flagsRouter from "./routes/local-flags";
import countdownRouter from "./routes/local-countdown";
import logsRouter from "./routes/local-logs";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "*",
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
