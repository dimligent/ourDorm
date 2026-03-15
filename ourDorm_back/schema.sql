-- 用户表
CREATE TABLE IF NOT EXISTS users (
  userId INTEGER PRIMARY KEY AUTOINCREMENT,
  userName TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  memberId INTEGER,
  FOREIGN KEY (memberId) REFERENCES members(memberId)
);

-- 宿舍成员表
CREATE TABLE IF NOT EXISTS members (
  memberId INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  birthday TEXT,
  hometown TEXT,
  hobby TEXT,
  role TEXT,
  avatar TEXT
);

-- Flag表
CREATE TABLE IF NOT EXISTS flags (
  flagId INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  needCheckin INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  createTime INTEGER NOT NULL
);

-- Flag参与成员表
CREATE TABLE IF NOT EXISTS flag_member (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flagId INTEGER NOT NULL,
  memberId INTEGER NOT NULL,
  FOREIGN KEY (flagId) REFERENCES flags(flagId),
  FOREIGN KEY (memberId) REFERENCES members(memberId)
);

-- Flag打卡记录表
CREATE TABLE IF NOT EXISTS flag_checkin (
  checkinId INTEGER PRIMARY KEY AUTOINCREMENT,
  flagId INTEGER NOT NULL,
  memberId INTEGER NOT NULL,
  checkinDate TEXT NOT NULL,
  FOREIGN KEY (flagId) REFERENCES flags(flagId),
  FOREIGN KEY (memberId) REFERENCES members(memberId)
);

-- 倒数日表
CREATE TABLE IF NOT EXISTS countdown (
  countdownId INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  targetDate TEXT NOT NULL,
  orderIndex INTEGER DEFAULT 0,
  createTime INTEGER NOT NULL
);

-- 宿舍日志表
CREATE TABLE IF NOT EXISTS dorm_log (
  logId INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  images TEXT,
  type TEXT,
  createTime INTEGER NOT NULL
);
