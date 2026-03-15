/// <reference path="../../worker-configuration.d.ts" />
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { JWTPayload, Env } from "../types";

type Variables = {
  user: JWTPayload;
};

const flagsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

flagsRouter.post("/createFlag", authMiddleware, async (c) => {
  try {
    const { title, content, needCheckin, memberIds } = await c.req.json();

    if (!title) {
      return c.json(
        {
          code: "400",
          message: "Flag信息不完整",
        },
        400,
      );
    }

    const createTime = Date.now();
    const result = await c.env.DB.prepare(
      "INSERT INTO flags (title, content, needCheckin, status, createTime) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(title, content || "", needCheckin ? 1 : 0, "active", createTime)
      .run();

    const flagId = result.meta.last_row_id;

    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      for (const memberId of memberIds) {
        await c.env.DB.prepare(
          "INSERT INTO flag_member (flagId, memberId) VALUES (?, ?)",
        )
          .bind(flagId, memberId)
          .run();
      }
    }

    return c.json({
      code: "200",
      message: "Flag创建成功",
      data: { id: flagId },
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

flagsRouter.get("/getFlags", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const memberId = user?.memberId ?? null;
    const today = new Date().toISOString().split("T")[0];

    const flags = await c.env.DB.prepare("SELECT * FROM flags WHERE status = ?")
      .bind("active")
      .all();

    const checkedSet = new Set<number>();
    if (memberId) {
      const checkins = await c.env.DB.prepare(
        "SELECT flagId FROM flag_checkin WHERE memberId = ? AND checkinDate = ?",
      )
        .bind(memberId, today)
        .all();
      for (const row of checkins.results as any[]) {
        checkedSet.add(Number(row.flagId));
      }
    }

    return c.json({
      code: "200",
      message: "获取Flag列表成功",
      data: (flags.results as any[]).map((f) => ({
        id: f.flagId,
        title: f.title,
        content: f.content ?? "",
        needCheckin: Boolean(f.needCheckin),
        status: f.status,
        createTime: f.createTime,
        checkedInToday: checkedSet.has(Number(f.flagId)),
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

flagsRouter.get("/getTrashFlags", authMiddleware, async (c) => {
  try {
    const flags = await c.env.DB.prepare("SELECT * FROM flags WHERE status = ?")
      .bind("deleted")
      .all();

    return c.json({
      code: "200",
      message: "获取垃圾箱Flag列表成功",
      data: (flags.results as any[]).map((f) => ({
        id: f.flagId,
        title: f.title,
        content: f.content ?? "",
        needCheckin: Boolean(f.needCheckin),
        status: f.status,
        createTime: f.createTime,
        checkedInToday: false,
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

flagsRouter.get("/getFlagDetail", async (c) => {
  try {
    const flagId = c.req.query("id");

    if (!flagId) {
      return c.json(
        {
          code: "400",
          message: "Flag ID不能为空",
        },
        400,
      );
    }

    const flag = (await c.env.DB.prepare("SELECT * FROM flags WHERE flagId = ?")
      .bind(flagId)
      .first()) as any;

    if (!flag) {
      return c.json(
        {
          code: "400",
          message: "Flag不存在",
        },
        400,
      );
    }

    const members = await c.env.DB.prepare(
      `
      SELECT m.* FROM members m
      INNER JOIN flag_member fm ON m.memberId = fm.memberId
      WHERE fm.flagId = ?
    `,
    )
      .bind(flagId)
      .all();

    const checkinLogs = await c.env.DB.prepare(
      `
      SELECT m.name as member, fc.checkinDate as date 
      FROM flag_checkin fc
      INNER JOIN members m ON fc.memberId = m.memberId
      WHERE fc.flagId = ?
    `,
    )
      .bind(flagId)
      .all();

    return c.json({
      code: "200",
      message: "获取Flag详情成功",
      data: {
        id: (flag as any).flagId,
        title: (flag as any).title,
        content: (flag as any).content ?? "",
        needCheckin: Boolean((flag as any).needCheckin),
        status: (flag as any).status,
        createTime: (flag as any).createTime,
        members: (members.results as any[]).map((m) => ({
          id: m.memberId,
          name: m.name,
          birthday: m.birthday ?? null,
          hometown: m.hometown ?? null,
          hobby: m.hobby ?? null,
          role: m.role ?? null,
          avatar: m.avatar ?? null,
        })),
        checkinLogs: (checkinLogs.results as any[]).map((r) => ({
          member: r.member,
          date: r.date,
        })),
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

flagsRouter.post("/checkinFlag", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const memberId = user?.memberId ?? null;
    const body = await c.req.json();
    const resolvedFlagId = body?.id ?? body?.flagId;

    if (!resolvedFlagId) {
      return c.json(
        {
          code: "400",
          message: "参数不完整",
        },
        400,
      );
    }

    if (!memberId) {
      return c.json(
        {
          code: "400",
          message: "当前用户未绑定成员信息，无法打卡",
        },
        400,
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const existingCheckin = await c.env.DB.prepare(
      "SELECT * FROM flag_checkin WHERE flagId = ? AND memberId = ? AND checkinDate = ?",
    )
      .bind(resolvedFlagId, memberId, today)
      .first();

    if (existingCheckin) {
      return c.json(
        {
          code: "400",
          message: "今日已打卡",
        },
        400,
      );
    }

    await c.env.DB.prepare(
      "INSERT INTO flag_checkin (flagId, memberId, checkinDate) VALUES (?, ?, ?)",
    )
      .bind(resolvedFlagId, memberId, today)
      .run();

    return c.json({
      code: "200",
      message: "打卡成功",
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

flagsRouter.post("/deleteFlag", authMiddleware, async (c) => {
  try {
    const { flagId, id } = await c.req.json();
    const resolvedId = id ?? flagId;

    if (!resolvedId) {
      return c.json(
        {
          code: "400",
          message: "Flag ID不能为空",
        },
        400,
      );
    }

    await c.env.DB.prepare("UPDATE flags SET status = ? WHERE flagId = ?")
      .bind("deleted", resolvedId)
      .run();

    return c.json({
      code: "200",
      message: "Flag已移入垃圾箱",
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

flagsRouter.post("/permanentlyDeleteFlag", authMiddleware, async (c) => {
  try {
    const { flagId, id } = await c.req.json();
    const resolvedId = id ?? flagId;

    if (!resolvedId) {
      return c.json(
        {
          code: "400",
          message: "Flag ID不能为空",
        },
        400,
      );
    }

    await c.env.DB.prepare("DELETE FROM flag_checkin WHERE flagId = ?")
      .bind(resolvedId)
      .run();
    await c.env.DB.prepare("DELETE FROM flag_member WHERE flagId = ?")
      .bind(resolvedId)
      .run();
    await c.env.DB.prepare("DELETE FROM flags WHERE flagId = ?")
      .bind(resolvedId)
      .run();

    return c.json({
      code: "200",
      message: "Flag已永久删除",
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

flagsRouter.post("/updateFlag", authMiddleware, async (c) => {
  try {
    const { flagId, id, title, content, needCheckin, memberIds } =
      await c.req.json();
    const resolvedId = id ?? flagId;

    if (!resolvedId || !title) {
      return c.json(
        {
          code: "400",
          message: "Flag信息不完整",
        },
        400,
      );
    }

    const existing = await c.env.DB.prepare(
      "SELECT * FROM flags WHERE flagId = ?",
    )
      .bind(resolvedId)
      .first();

    if (!existing) {
      return c.json(
        {
          code: "400",
          message: "Flag不存在",
        },
        400,
      );
    }

    await c.env.DB.prepare(
      "UPDATE flags SET title = ?, content = ?, needCheckin = ? WHERE flagId = ?",
    )
      .bind(title, content || "", needCheckin ? 1 : 0, resolvedId)
      .run();

    if (memberIds !== undefined) {
      await c.env.DB.prepare("DELETE FROM flag_member WHERE flagId = ?")
        .bind(resolvedId)
        .run();
      if (Array.isArray(memberIds) && memberIds.length > 0) {
        for (const memberId of memberIds) {
          await c.env.DB.prepare(
            "INSERT INTO flag_member (flagId, memberId) VALUES (?, ?)",
          )
            .bind(resolvedId, memberId)
            .run();
        }
      }
    }

    return c.json({
      code: "200",
      message: "Flag更新成功",
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

flagsRouter.post("/restoreFlag", authMiddleware, async (c) => {
  try {
    const { flagId, id } = await c.req.json();
    const resolvedId = id ?? flagId;

    if (!resolvedId) {
      return c.json(
        {
          code: "400",
          message: "Flag ID不能为空",
        },
        400,
      );
    }

    await c.env.DB.prepare("UPDATE flags SET status = ? WHERE flagId = ?")
      .bind("active", resolvedId)
      .run();

    return c.json({
      code: "200",
      message: "Flag恢复成功",
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

export default flagsRouter;
