/// <reference path="../../worker-configuration.d.ts" />
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { JWTPayload, Env } from "../types";

type Variables = {
  user: JWTPayload;
};

const logsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

logsRouter.post("/createLog", authMiddleware, async (c) => {
  try {
    const { title, content, images, type } = await c.req.json();

    if (!title) {
      return c.json(
        {
          code: "400",
          message: "日志信息不完整",
        },
        400,
      );
    }

    const imagesJson = images ? JSON.stringify(images) : "[]";
    const createTime = Date.now();

    const result = await c.env.DB.prepare(
      "INSERT INTO dorm_log (title, content, images, type, createTime) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(title, content || "", imagesJson, type || "日常", createTime)
      .run();

    return c.json({
      code: "200",
      message: "日志创建成功",
      data: { id: result.meta.last_row_id },
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

logsRouter.get("/getLogs", async (c) => {
  try {
    const logId = c.req.query("id");

    if (logId) {
      const log = (await c.env.DB.prepare(
        "SELECT * FROM dorm_log WHERE logId = ?",
      )
        .bind(logId)
        .first()) as any;

      if (!log) {
        return c.json(
          {
            code: "400",
            message: "日志不存在",
          },
          400,
        );
      }

      const images = log.images ? JSON.parse(log.images) : [];

      return c.json({
        code: "200",
        message: "获取日志成功",
        data: {
          id: (log as any).logId,
          title: (log as any).title,
          content: (log as any).content ?? "",
          images,
          type: (log as any).type ?? "日常",
          createTime: (log as any).createTime,
        },
      });
    } else {
      const logsResult = await c.env.DB.prepare(
        "SELECT * FROM dorm_log ORDER BY createTime DESC",
      ).all();
      const logs = logsResult.results as any[];

      const data = logs.map((row) => ({
        id: row.logId,
        title: row.title,
        content: row.content ?? "",
        images: row.images ? JSON.parse(row.images) : [],
        type: row.type ?? "日常",
        createTime: row.createTime,
      }));

      return c.json({
        code: "200",
        message: "获取日志列表成功",
        data,
      });
    }
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

logsRouter.post("/deleteLog", authMiddleware, async (c) => {
  try {
    const { logId, id } = await c.req.json();
    const resolvedId = id ?? logId;

    if (!resolvedId) {
      return c.json(
        {
          code: "400",
          message: "日志ID不能为空",
        },
        400,
      );
    }

    await c.env.DB.prepare("DELETE FROM dorm_log WHERE logId = ?")
      .bind(resolvedId)
      .run();

    return c.json({
      code: "200",
      message: "日志删除成功",
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

logsRouter.post("/updateLog", authMiddleware, async (c) => {
  try {
    const { logId, id, title, content, images, type } = await c.req.json();
    const resolvedId = id ?? logId;

    if (!resolvedId || !title) {
      return c.json(
        {
          code: "400",
          message: "日志信息不完整",
        },
        400,
      );
    }

    const existing = await c.env.DB.prepare(
      "SELECT * FROM dorm_log WHERE logId = ?",
    )
      .bind(resolvedId)
      .first();

    if (!existing) {
      return c.json(
        {
          code: "400",
          message: "日志不存在",
        },
        400,
      );
    }

    const imagesJson =
      images !== undefined ? JSON.stringify(images) : (existing as any).images;
    const logType = type !== undefined ? type : (existing as any).type;
    const logContent =
      content !== undefined ? content : (existing as any).content;

    await c.env.DB.prepare(
      "UPDATE dorm_log SET title = ?, content = ?, images = ?, type = ? WHERE logId = ?",
    )
      .bind(title, logContent, imagesJson, logType, resolvedId)
      .run();

    return c.json({
      code: "200",
      message: "日志更新成功",
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

export default logsRouter;
