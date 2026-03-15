/// <reference path="../../worker-configuration.d.ts" />
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { authMiddleware, generateToken } from "../middleware/auth";
import type { JWTPayload, Env } from "../types";

type Variables = {
  user: JWTPayload;
};

const authRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

authRouter.post("/register", async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json(
        {
          code: "400",
          message: "用户名和密码不能为空",
        },
        400,
      );
    }

    const existingUser = await c.env.DB.prepare(
      "SELECT * FROM users WHERE userName = ?",
    )
      .bind(username)
      .first();

    if (existingUser) {
      return c.json(
        {
          code: "400",
          message: "用户名已存在",
        },
        400,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-create a member row and bind it to the user for check-in identity.
    const memberResult = await c.env.DB.prepare(
      "INSERT INTO members (name, birthday, hometown, hobby, role, avatar) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(username, null, null, null, null, null)
      .run();
    const memberId = memberResult.meta.last_row_id as number;

    await c.env.DB.prepare(
      "INSERT INTO users (userName, password, memberId) VALUES (?, ?, ?)",
    )
      .bind(username, hashedPassword, memberId)
      .run();

    return c.json({
      code: "200",
      message: "注册成功",
    });
  } catch (error) {
    return c.json(
      {
        code: "500",
        message: "服务器内部错误",
      },
      500,
    );
  }
});

authRouter.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json(
        {
          code: "400",
          message: "用户名和密码不能为空",
        },
        400,
      );
    }

    const user = (await c.env.DB.prepare(
      "SELECT * FROM users WHERE userName = ?",
    )
      .bind(username)
      .first()) as any;

    if (!user) {
      return c.json(
        {
          code: "400",
          message: "用户名或密码错误",
        },
        400,
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return c.json(
        {
          code: "400",
          message: "用户名或密码错误",
        },
        400,
      );
    }

    const payload: JWTPayload = {
      userId: user.userId,
      username: user.userName,
      memberId: (user as any).memberId ?? null,
    };

    const token = generateToken(payload, c.env);

    return c.json({
      code: "200",
      message: "登录成功",
      JWT: token,
    });
  } catch (error) {
    return c.json(
      {
        code: "500",
        message: "服务器内部错误",
      },
      500,
    );
  }
});

authRouter.get("/me", authMiddleware, async (c) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          code: "401",
          message: "未登录或Token无效",
        },
        401,
      );
    }

    return c.json({
      code: "200",
      message: "获取用户信息成功",
      data: {
        userId: user.userId,
        username: user.username,
        memberId: user.memberId,
      },
    });
  } catch (error) {
    return c.json(
      {
        code: "500",
        message: "服务器内部错误",
      },
      500,
    );
  }
});

export default authRouter;
