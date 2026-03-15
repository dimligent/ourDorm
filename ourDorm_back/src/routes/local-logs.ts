import { Hono } from "hono";
import db from "../db";
import { authMiddleware } from "../middleware/auth";

const logsRouter = new Hono();

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

    db.prepare(
      "INSERT INTO dorm_log (title, content, images, type, createTime) VALUES (?, ?, ?, ?, ?)",
    ).run(title, content || "", imagesJson, type || "日常", createTime);

    return c.json({
      code: "200",
      message: "日志创建成功",
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

logsRouter.get("/getLogs", (c) => {
  try {
    const logId = c.req.query("id");

    if (logId) {
      const log = db
        .prepare("SELECT * FROM dorm_log WHERE logId = ?")
        .get(logId) as any;

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
      const logs = db
        .prepare("SELECT * FROM dorm_log ORDER BY createTime DESC")
        .all() as any[];

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

    db.prepare("DELETE FROM dorm_log WHERE logId = ?").run(resolvedId);

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

    const existing = db
      .prepare("SELECT * FROM dorm_log WHERE logId = ?")
      .get(resolvedId);

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

    db.prepare(
      "UPDATE dorm_log SET title = ?, content = ?, images = ?, type = ? WHERE logId = ?",
    ).run(title, logContent, imagesJson, logType, resolvedId);

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
