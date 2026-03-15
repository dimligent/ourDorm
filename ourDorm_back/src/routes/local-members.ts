import { Hono } from "hono";
import db from "../db";
import { authMiddleware } from "../middleware/auth";

const membersRouter = new Hono();

membersRouter.get("/getmembers", (c) => {
  try {
    const members = db.prepare("SELECT * FROM members").all();

    return c.json({
      code: "200",
      message: "获取成员列表成功",
      data: (members as any[]).map((m) => ({
        id: m.memberId,
        name: m.name,
        birthday: m.birthday ?? null,
        hometown: m.hometown ?? null,
        hobby: m.hobby ?? null,
        role: m.role ?? null,
        avatar: m.avatar ?? null,
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

membersRouter.get("/getMemberDetail", (c) => {
  try {
    const id = c.req.query("id");

    if (!id) {
      return c.json(
        {
          code: "400",
          message: "成员ID不能为空",
        },
        400,
      );
    }

    const member = db
      .prepare("SELECT * FROM members WHERE memberId = ?")
      .get(id) as any;

    if (!member) {
      return c.json(
        {
          code: "400",
          message: "成员不存在",
        },
        400,
      );
    }

    return c.json({
      code: "200",
      message: "获取成员信息成功",
      data: {
        id: member.memberId,
        name: member.name,
        birthday: member.birthday ?? null,
        hometown: member.hometown ?? null,
        hobby: member.hobby ?? null,
        role: member.role ?? null,
        avatar: member.avatar ?? null,
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

membersRouter.post("/addmembers", authMiddleware, async (c) => {
  try {
    const { name, birthday, hometown, hobby, role, avatar } =
      await c.req.json();

    if (!name) {
      return c.json(
        {
          code: "400",
          message: "成员信息不完整",
        },
        400,
      );
    }

    db.prepare(
      "INSERT INTO members (name, birthday, hometown, hobby, role, avatar) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(
      name,
      birthday || null,
      hometown || null,
      hobby || null,
      role || null,
      avatar || null,
    );

    return c.json({
      code: "200",
      message: "成员添加成功",
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

membersRouter.post("/updateMember", authMiddleware, async (c) => {
  try {
    const { memberId, name, birthday, hometown, hobby, role, avatar } =
      await c.req.json();

    if (!memberId || !name) {
      return c.json(
        {
          code: "400",
          message: "成员信息不完整",
        },
        400,
      );
    }

    const existing = db
      .prepare("SELECT * FROM members WHERE memberId = ?")
      .get(memberId);

    if (!existing) {
      return c.json(
        {
          code: "400",
          message: "成员不存在",
        },
        400,
      );
    }

    db.prepare(
      "UPDATE members SET name = ?, birthday = ?, hometown = ?, hobby = ?, role = ?, avatar = ? WHERE memberId = ?",
    ).run(
      name,
      birthday || null,
      hometown || null,
      hobby || null,
      role || null,
      avatar || null,
      memberId,
    );

    return c.json({
      code: "200",
      message: "成员更新成功",
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

membersRouter.post("/deleteMember", authMiddleware, async (c) => {
  try {
    const { memberId } = await c.req.json();

    if (!memberId) {
      return c.json(
        {
          code: "400",
          message: "成员ID不能为空",
        },
        400,
      );
    }

    const existing = db
      .prepare("SELECT * FROM members WHERE memberId = ?")
      .get(memberId);

    if (!existing) {
      return c.json(
        {
          code: "400",
          message: "成员不存在",
        },
        400,
      );
    }

    db.prepare("DELETE FROM flag_checkin WHERE memberId = ?").run(memberId);
    db.prepare("DELETE FROM flag_member WHERE memberId = ?").run(memberId);
    db.prepare("DELETE FROM members WHERE memberId = ?").run(memberId);

    return c.json({
      code: "200",
      message: "成员删除成功",
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

export default membersRouter;
