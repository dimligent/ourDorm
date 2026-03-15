import { Hono } from "hono";
import db from "../db";
import { authMiddleware } from "../middleware/auth";

const flagsRouter = new Hono();

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
    const result = db
      .prepare(
        "INSERT INTO flags (title, content, needCheckin, status, createTime) VALUES (?, ?, ?, ?, ?)",
      )
      .run(title, content || "", needCheckin ? 1 : 0, "active", createTime);

    const flagId = result.lastInsertRowid as number;

    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      const insertMember = db.prepare(
        "INSERT INTO flag_member (flagId, memberId) VALUES (?, ?)",
      );
      for (const memberId of memberIds) {
        insertMember.run(flagId, memberId);
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

flagsRouter.get("/getFlags", authMiddleware, (c) => {
  try {
    const user = c.get("user") as any;
    const memberId = user?.memberId ?? null;
    const today = new Date().toISOString().split("T")[0];

    const flags = db
      .prepare("SELECT * FROM flags WHERE status = ?")
      .all("active");

    const checkedSet = new Set<number>();
    if (memberId) {
      const checkins = db
        .prepare(
          "SELECT flagId FROM flag_checkin WHERE memberId = ? AND checkinDate = ?",
        )
        .all(memberId, today) as any[];
      for (const row of checkins) {
        checkedSet.add(Number((row as any).flagId));
      }
    }

    return c.json({
      code: "200",
      message: "获取Flag列表成功",
      data: (flags as any[]).map((f) => ({
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

flagsRouter.get("/getTrashFlags", authMiddleware, (c) => {
  try {
    const flags = db
      .prepare("SELECT * FROM flags WHERE status = ?")
      .all("deleted");

    return c.json({
      code: "200",
      message: "获取垃圾箱Flag列表成功",
      data: (flags as any[]).map((f) => ({
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

flagsRouter.get("/getFlagDetail", (c) => {
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

    const flag = db
      .prepare("SELECT * FROM flags WHERE flagId = ?")
      .get(flagId) as any;

    if (!flag) {
      return c.json(
        {
          code: "400",
          message: "Flag不存在",
        },
        400,
      );
    }

    const members = db
      .prepare(
        `
      SELECT m.* FROM members m
      INNER JOIN flag_member fm ON m.memberId = fm.memberId
      WHERE fm.flagId = ?
    `,
      )
      .all(flagId);

    const checkinLogs = db
      .prepare(
        `
      SELECT m.name as member, fc.checkinDate as date 
      FROM flag_checkin fc
      INNER JOIN members m ON fc.memberId = m.memberId
      WHERE fc.flagId = ?
    `,
      )
      .all(flagId);

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
        members: (members as any[]).map((m) => ({
          id: m.memberId,
          name: m.name,
          birthday: m.birthday ?? null,
          hometown: m.hometown ?? null,
          hobby: m.hobby ?? null,
          role: m.role ?? null,
          avatar: m.avatar ?? null,
        })),
        checkinLogs: (checkinLogs as any[]).map((r) => ({
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
    const user = c.get("user") as any;
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

    const existingCheckin = db
      .prepare(
        "SELECT * FROM flag_checkin WHERE flagId = ? AND memberId = ? AND checkinDate = ?",
      )
      .get(resolvedFlagId, memberId, today);

    if (existingCheckin) {
      return c.json(
        {
          code: "400",
          message: "今日已打卡",
        },
        400,
      );
    }

    db.prepare(
      "INSERT INTO flag_checkin (flagId, memberId, checkinDate) VALUES (?, ?, ?)",
    ).run(resolvedFlagId, memberId, today);

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

    db.prepare("UPDATE flags SET status = ? WHERE flagId = ?").run(
      "deleted",
      resolvedId,
    );

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

    db.prepare("DELETE FROM flag_checkin WHERE flagId = ?").run(resolvedId);
    db.prepare("DELETE FROM flag_member WHERE flagId = ?").run(resolvedId);
    db.prepare("DELETE FROM flags WHERE flagId = ?").run(resolvedId);

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

    const existing = db
      .prepare("SELECT * FROM flags WHERE flagId = ?")
      .get(resolvedId);

    if (!existing) {
      return c.json(
        {
          code: "400",
          message: "Flag不存在",
        },
        400,
      );
    }

    db.prepare(
      "UPDATE flags SET title = ?, content = ?, needCheckin = ? WHERE flagId = ?",
    ).run(title, content || "", needCheckin ? 1 : 0, resolvedId);

    if (memberIds !== undefined) {
      db.prepare("DELETE FROM flag_member WHERE flagId = ?").run(resolvedId);
      if (Array.isArray(memberIds) && memberIds.length > 0) {
        const insertMember = db.prepare(
          "INSERT INTO flag_member (flagId, memberId) VALUES (?, ?)",
        );
        for (const memberId of memberIds) {
          insertMember.run(resolvedId, memberId);
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

    db.prepare("UPDATE flags SET status = ? WHERE flagId = ?").run(
      "active",
      resolvedId,
    );

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
