import { Hono } from "hono";
import db from "../db";
import { authMiddleware } from "../middleware/auth";

const countdownRouter = new Hono();

countdownRouter.post("/createCountdown", authMiddleware, async (c) => {
  try {
    const { title, targetDate } = await c.req.json();

    if (!title || !targetDate) {
      return c.json(
        {
          code: "400",
          message: "倒数日信息不完整",
        },
        400,
      );
    }

    const maxOrder = db
      .prepare("SELECT MAX(orderIndex) as maxOrder FROM countdown")
      .get() as any;
    const orderIndex = (maxOrder?.maxOrder || 0) + 1;
    const createTime = Date.now();

    db.prepare(
      "INSERT INTO countdown (title, targetDate, orderIndex, createTime) VALUES (?, ?, ?, ?)",
    ).run(title, targetDate, orderIndex, createTime);

    return c.json({
      code: "200",
      message: "倒数日创建成功",
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

countdownRouter.get("/getCountdowns", (c) => {
  try {
    const countdowns = db
      .prepare("SELECT * FROM countdown ORDER BY orderIndex")
      .all() as any[];

    const now = new Date();
    const data = countdowns.map((item) => {
      const target = new Date(item.targetDate);
      const diffTime = target.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let color = "green";
      if (daysLeft < 30) {
        color = "yellow";
      }
      if (daysLeft < 7) {
        color = "red";
      }

      return {
        ...item,
        daysLeft,
        color,
      };
    });

    return c.json({
      code: "200",
      message: "获取倒数日成功",
      data: data.map((item) => ({
        id: item.countdownId,
        title: item.title,
        date: item.targetDate,
        daysLeft: item.daysLeft,
        color: item.color,
        orderIndex: item.orderIndex,
        createTime: item.createTime,
      })),
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

countdownRouter.post("/updateCountdown", authMiddleware, async (c) => {
  try {
    const { countdownId, id, title, targetDate } = await c.req.json();
    const resolvedId = id ?? countdownId;

    if (!resolvedId || !title || !targetDate) {
      return c.json(
        {
          code: "400",
          message: "倒数日信息不完整",
        },
        400,
      );
    }

    const existing = db
      .prepare("SELECT * FROM countdown WHERE countdownId = ?")
      .get(resolvedId);

    if (!existing) {
      return c.json(
        {
          code: "400",
          message: "倒数日不存在",
        },
        400,
      );
    }

    db.prepare(
      "UPDATE countdown SET title = ?, targetDate = ? WHERE countdownId = ?",
    ).run(title, targetDate, resolvedId);

    return c.json({
      code: "200",
      message: "倒数日修改成功",
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

countdownRouter.post("/deleteCountdown", authMiddleware, async (c) => {
  try {
    const { countdownId, id } = await c.req.json();
    const resolvedId = id ?? countdownId;

    if (!resolvedId) {
      return c.json(
        {
          code: "400",
          message: "倒数日ID不能为空",
        },
        400,
      );
    }

    db.prepare("DELETE FROM countdown WHERE countdownId = ?").run(resolvedId);

    return c.json({
      code: "200",
      message: "删除成功",
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

export default countdownRouter;
