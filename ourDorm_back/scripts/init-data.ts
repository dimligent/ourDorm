import bcrypt from "bcryptjs";
import db from "../src/db/index.ts";

console.log("开始初始化示例数据...");

const hashedPassword = bcrypt.hashSync("admin123", 10);

const members = [
  {
    name: "张三",
    birthday: "2003-05-01",
    hometown: "山东",
    hobby: "篮球",
    role: "舍长",
    avatar: "",
  },
  {
    name: "李四",
    birthday: "2003-07-15",
    hometown: "江苏",
    hobby: "音乐",
    role: "学习委员",
    avatar: "",
  },
  {
    name: "王五",
    birthday: "2003-09-20",
    hometown: "浙江",
    hobby: "编程",
    role: "技术委员",
    avatar: "",
  },
  {
    name: "赵六",
    birthday: "2003-11-10",
    hometown: "广东",
    hobby: "摄影",
    role: "生活委员",
    avatar: "",
  },
];

let firstMemberId: number | null = null;

members.forEach((member) => {
  try {
    const existing = db
      .prepare("SELECT memberId FROM members WHERE name = ?")
      .get(member.name) as any;

    if (!existing) {
      db.prepare(
        "INSERT INTO members (name, birthday, hometown, hobby, role, avatar) VALUES (?, ?, ?, ?, ?, ?)",
      ).run(
        member.name,
        member.birthday,
        member.hometown,
        member.hobby,
        member.role,
        member.avatar,
      );
      console.log(`✅ 创建成员: ${member.name}`);
    } else {
      console.log(`⚠️  成员 ${member.name} 已存在`);
    }

    if (firstMemberId === null) {
      firstMemberId = (existing?.memberId ??
        (db
          .prepare("SELECT memberId FROM members WHERE name = ?")
          .get(member.name) as any)?.memberId) ?? null;
    }
  } catch (error) {
    if (firstMemberId === null) {
      const row = db
        .prepare("SELECT memberId FROM members WHERE name = ?")
        .get(member.name) as any;
      firstMemberId = row?.memberId ?? null;
    }
    console.log(`⚠️  成员 ${member.name} 初始化失败`);
  }
});

try {
  const memberIdToBind =
    firstMemberId ??
    ((db.prepare("SELECT memberId FROM members ORDER BY memberId LIMIT 1").get() as any)
      ?.memberId ?? null);

  db.prepare("INSERT INTO users (userName, password, memberId) VALUES (?, ?, ?)").run(
    "admin",
    hashedPassword,
    memberIdToBind,
  );
  console.log("✅ 创建管理员用户: admin/admin123");
} catch (error) {
  // Ensure existing admin user is bound to a memberId for check-ins.
  try {
    const memberIdToBind =
      firstMemberId ??
      ((db.prepare("SELECT memberId FROM members ORDER BY memberId LIMIT 1").get() as any)
        ?.memberId ?? null);

    const adminRow = db
      .prepare("SELECT userId, memberId FROM users WHERE userName = ?")
      .get("admin") as any;

    if (adminRow && (adminRow.memberId === null || adminRow.memberId === undefined) && memberIdToBind) {
      db.prepare("UPDATE users SET memberId = ? WHERE userId = ?").run(
        memberIdToBind,
        adminRow.userId,
      );
      console.log("✅ 已为管理员用户绑定 memberId");
    } else {
      console.log("⚠️  管理员用户已存在");
    }
  } catch {
    console.log("⚠️  管理员用户已存在");
  }
}

const flags = [
  {
    title: "每天背50个单词",
    content: "坚持每天背单词，提升英语水平",
    needCheckin: 1,
  },
  { title: "每周健身3次", content: "保持身体健康，增强体质", needCheckin: 1 },
  { title: "期末考试复习", content: "为期末考试做好准备", needCheckin: 0 },
];

flags.forEach((flag) => {
  try {
    db.prepare(
      "INSERT INTO flags (title, content, needCheckin, status, createTime) VALUES (?, ?, ?, ?, ?)",
    ).run(flag.title, flag.content, flag.needCheckin, "active", Date.now());
    console.log(`✅ 创建Flag: ${flag.title}`);
  } catch (error) {
    console.log(`⚠️  Flag ${flag.title} 已存在`);
  }
});

const now = new Date();
const countdowns = [
  {
    title: "英语六级考试",
    targetDate: new Date(now.getTime() + 95 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  },
  {
    title: "期末考试",
    targetDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  },
  {
    title: "暑假开始",
    targetDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  },
];

countdowns.forEach((cd, index) => {
  try {
    db.prepare(
      "INSERT INTO countdown (title, targetDate, orderIndex, createTime) VALUES (?, ?, ?, ?)",
    ).run(cd.title, cd.targetDate, index + 1, Date.now());
    console.log(`✅ 创建倒数日: ${cd.title}`);
  } catch (error) {
    console.log(`⚠️  倒数日 ${cd.title} 已存在`);
  }
});

const logs = [
  {
    title: "宿舍聚餐",
    content: "今天大家一起吃火锅，非常开心",
    type: "聚餐",
    images: '["hotpot.jpg", "group.jpg"]',
  },
  {
    title: "第一次宿舍会议",
    content: "讨论本学期的学习计划和值日安排",
    type: "会议",
    images: '["meeting.jpg"]',
  },
  {
    title: "周末出游",
    content: "一起去公园野餐，天气很好",
    type: "出游",
    images: '["picnic.jpg", "park.jpg"]',
  },
];

logs.forEach((log) => {
  try {
    db.prepare(
      "INSERT INTO dorm_log (title, content, images, type, createTime) VALUES (?, ?, ?, ?, ?)",
    ).run(log.title, log.content, log.images, log.type, Date.now());
    console.log(`✅ 创建日志: ${log.title}`);
  } catch (error) {
    console.log(`⚠️  日志 ${log.title} 已存在`);
  }
});

console.log("\n🎉 示例数据初始化完成！");
console.log("\n📝 测试账号信息：");
console.log("   用户名: admin");
console.log("   密码: admin123");
console.log("\n🚀 启动服务器: npm run dev");
