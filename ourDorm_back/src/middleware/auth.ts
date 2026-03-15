import jwt from "jsonwebtoken";
import type { Context, Next } from "hono";
import type { JWTPayload, Env } from "../types";

type Variables = {
  user: JWTPayload;
};

export function generateToken(payload: JWTPayload, env: Env): string {
  const JWT_SECRET = env.JWT_SECRET || "723-dorm-secret-key";
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string, env: Env): JWTPayload | null {
  try {
    const JWT_SECRET = env.JWT_SECRET || "723-dorm-secret-key";
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function authMiddleware(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next,
) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        code: "401",
        message: "未登录或Token无效",
      },
      401,
    );
  }

  let token = authHeader.substring(7).trim();

  // Common Postman copy/paste mistakes: wrapping the token in <> or quotes.
  if (
    (token.startsWith("<") && token.endsWith(">")) ||
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    token = token.slice(1, -1).trim();
  }

  const payload = verifyToken(token, c.env);

  if (!payload) {
    return c.json(
      {
        code: "401",
        message: "未登录或Token无效",
      },
      401,
    );
  }

  c.set("user", payload);
  await next();
}
