import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Hono } from "hono";
import app from "../src/index";

describe("723宿舍官网API测试", () => {
  let authToken: string;
  let testUserId: number;
  let testMemberId: number;
  let testFlagId: number;
  let testCountdownId: number;
  let testLogId: number;

  it("GET / 应该返回欢迎信息", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.code).toBe("200");
    expect(json.message).toContain("723宿舍");
  });

  describe("用户认证模块", () => {
    it("POST /auth/register 应该成功注册用户", async () => {
      const res = await app.request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "testuser",
          password: "test123456",
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.code).toBe("200");
    });

    it("POST /auth/register 不应该允许重复注册", async () => {
      const res = await app.request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "testuser",
          password: "test123456",
        }),
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe("400");
      expect(json.message).toContain("已存在");
    });

    it("POST /auth/login 应该成功登录", async () => {
      const res = await app.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "testuser",
          password: "test123456",
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.code).toBe("200");
      expect(json.JWT).toBeDefined();
      authToken = json.JWT;
    });

    it("POST /auth/login 不应该允许错误的密码", async () => {
      const res = await app.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "testuser",
          password: "wrongpassword",
        }),
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe("400");
    });
  });

  describe("成员信息模块", () => {
    it("GET /members/getmembers 应该返回成员列表", async () => {
      const res = await app.request("/members/getmembers");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.code).toBe("200");
      expect(Array.isArray(json.data)).toBe(true);
    });

    it("POST /members/addmembers 应该成功添加成员", async () => {
      const res = await app.request("/members/addmembers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "张三",
          birthday: "2003-05-01",
          hometown: "山东",
          hobby: "篮球",
          role: "舍长",
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.code).toBe("200");
    });
  });

  describe("Flag追踪模块", () => {
    it("POST /flags/createFlag 应该成功创建Flag", async () => {
      const res = await app.request("/flags/createFlag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "每天背50个单词",
          content: "坚持每天背单词，提升英语水平",
          needCheckin: true,
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.code).toBe("200");
    });

    it("GET /flags/getFlags 应该返回Flag列表", async () => {
      const res = await app.request("/flags/getFlags");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.code).toBe("200");
      expect(Array.isArray(json.data)).toBe(true);
    });

    it("POST /flags/deleteFlag 应该成功删除Flag", async () => {
      const res = await app.request("/flags/deleteFlag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flagId: 1,
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.code).toBe("200");
    });
  });

  describe("倒数日模块", () => {
    it("POST /countdown/createCountdown 应该成功创建倒数日", async () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      const res = await app.request("/countdown/createCountdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "英语六级考试",
          targetDate: targetDate.toISOString().split("T")[0],
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.code).toBe("200");
    });

    it("GET /countdown/getCountdowns 应该返回倒数日列表", async () => {
      const res = await app.request("/countdown/getCountdowns");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.code).toBe("200");
      expect(Array.isArray(json.data)).toBe(true);
    });
  });

  describe("宿舍日志模块", () => {
    it("POST /logs/createLog 应该成功创建日志", async () => {
      const res = await app.request("/logs/createLog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "宿舍聚餐",
          content: "今天大家一起吃火锅，非常开心",
          images: ["img1.jpg", "img2.jpg"],
          type: "聚餐",
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.code).toBe("200");
    });

    it("GET /logs/getLogs 应该返回日志列表", async () => {
      const res = await app.request("/logs/getLogs");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.code).toBe("200");
      expect(Array.isArray(json.data)).toBe(true);
    });
  });
});
