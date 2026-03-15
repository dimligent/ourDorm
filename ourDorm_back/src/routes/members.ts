/// <reference path="../../worker-configuration.d.ts" />
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { JWTPayload, Env } from "../types";

type Variables = {
  user: JWTPayload;
};

const membersRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

membersRouter.get("/getmembers", async (c) => {
  try {
    const members = await c.env.DB.prepare("SELECT * FROM members").all();

    return c.json({
      code: "200",
      message: "获取成员列表成功",
      data: (members.results as any[]).map((m) => ({
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

membersRouter.get("/getMemberDetail", async (c) => {
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

    const member = (await c.env.DB.prepare(
      "SELECT * FROM members WHERE memberId = ?",
    )
      .bind(id)
      .first()) as any;

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

    await c.env.DB.prepare(
      "INSERT INTO members (name, birthday, hometown, hobby, role, avatar) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(
        name,
        birthday || null,
        hometown || null,
        hobby || null,
        role || null,
        avatar || null,
      )
      .run();

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

    const existing = await c.env.DB.prepare(
      "SELECT * FROM members WHERE memberId = ?",
    )
      .bind(memberId)
      .first();

    if (!existing) {
      return c.json(
        {
          code: "400",
          message: "成员不存在",
        },
        400,
      );
    }

    await c.env.DB.prepare(
      "UPDATE members SET name = ?, birthday = ?, hometown = ?, hobby = ?, role = ?, avatar = ? WHERE memberId = ?",
    )
      .bind(
        name,
        birthday || null,
        hometown || null,
        hobby || null,
        role || null,
        avatar || null,
        memberId,
      )
      .run();

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

    const existing = await c.env.DB.prepare(
      "SELECT * FROM members WHERE memberId = ?",
    )
      .bind(memberId)
      .first();

    if (!existing) {
      return c.json(
        {
          code: "400",
          message: "成员不存在",
        },
        400,
      );
    }

    await c.env.DB.prepare("DELETE FROM flag_checkin WHERE memberId = ?")
      .bind(memberId)
      .run();
    await c.env.DB.prepare("DELETE FROM flag_member WHERE memberId = ?")
      .bind(memberId)
      .run();
    await c.env.DB.prepare("DELETE FROM members WHERE memberId = ?")
      .bind(memberId)
      .run();

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
