# 723宿舍官网后端项目结构

## 项目概述

本项目是基于 Hono 框架开发的 723 宿舍官网后端 API 服务，提供用户认证、成员管理、Flag 追踪、倒数日和宿舍日志等功能。

## 技术栈

- **框架**: Hono (轻量级 Web 框架)
- **数据库**: SQLite (better-sqlite3)
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **运行环境**: Node.js / Bun
- **部署**: Cloudflare Workers

## 项目目录结构

```
ourDorm/
├── src/
│   ├── index.ts              # 主入口文件，路由配置
│   ├── db/
│   │   └── index.ts          # 数据库连接和表结构初始化
│   ├── middleware/
│   │   └── auth.ts           # JWT 认证中间件
│   ├── routes/
│   │   ├── auth.ts           # 用户认证路由
│   │   ├── members.ts        # 成员管理路由
│   │   ├── flags.ts          # Flag 追踪路由
│   │   ├── countdown.ts      # 倒数日路由
│   │   └── logs.ts           # 宿舍日志路由
│   └── types/
│       └── index.ts          # TypeScript 类型定义
├── test/
│   └── api.test.ts           # API 测试文件
├── dorm.db                   # SQLite 数据库文件（自动生成）
├── package.json              # 项目配置文件
├── wrangler.toml             # Cloudflare Workers 配置文件
├── tsconfig.json             # TypeScript 配置文件
└── README.md                 # 项目说明文档
```

## 数据库表结构

### 1. users 用户表

| 字段名   | 类型   | 注释   |
| -------- | ------ | ------ |
| userId   | int64  | 用户ID |
| userName | string | 用户名 |
| password | string | 密码   |

### 2. members 宿舍成员表

| 字段名   | 类型   | 注释     |
| -------- | ------ | -------- |
| memberId | int64  | 成员ID   |
| name     | string | 成员姓名 |
| birthday | date   | 生日     |
| hometown | string | 家乡     |
| hobby    | string | 爱好     |
| role     | string | 宿舍角色 |
| avatar   | string | 成员头像 |

### 3. flags Flag表

| 字段名      | 类型     | 注释                   |
| ----------- | -------- | ---------------------- |
| flagId      | int64    | Flag ID                |
| title       | string   | Flag标题               |
| content     | string   | Flag内容               |
| needCheckin | boolean  | 是否需要打卡           |
| status      | string   | 状态(active / deleted) |
| createTime  | datetime | 创建时间（时间戳）     |

### 4. flag_member Flag参与成员表

| 字段名   | 类型  | 注释    |
| -------- | ----- | ------- |
| id       | int64 | 主键    |
| flagId   | int64 | Flag ID |
| memberId | int64 | 成员ID  |

### 5. flag_checkin Flag打卡记录表

| 字段名      | 类型  | 注释     |
| ----------- | ----- | -------- |
| checkinId   | int64 | 打卡ID   |
| flagId      | int64 | Flag ID  |
| memberId    | int64 | 成员ID   |
| checkinDate | date  | 打卡日期 |

### 6. countdown 倒数日表

| 字段名      | 类型     | 注释     |
| ----------- | -------- | -------- |
| countdownId | int64    | 倒数日ID |
| title       | string   | 标题     |
| targetDate  | date     | 目标日期 |
| orderIndex  | int      | 卡片排序 |
| createTime  | datetime | 创建时间 |

### 7. dorm_log 宿舍日志表

| 字段名     | 类型     | 注释           |
| ---------- | -------- | -------------- |
| logId      | int64    | 日志ID         |
| title      | string   | 标题           |
| content    | string   | 内容           |
| images     | string   | 图片(JSON数组) |
| type       | string   | 日志类型       |
| createTime | datetime | 创建时间       |

## API 接口文档

### 用户认证模块

#### POST /auth/register

用户注册

**请求体**:

```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:

```json
{
  "code": "200",
  "message": "注册成功"
}
```

#### POST /auth/login

用户登录

**请求体**:

```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:

```json
{
  "code": "200",
  "message": "登录成功",
  "JWT": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

#### GET /auth/me

获取当前登录用户信息

**请求头**:

```
Authorization: Bearer <token>
```

**响应**:

```json
{
  "code": "200",
  "message": "获取用户信息成功",
  "data": {
    "userId": 1,
    "userName": "zhangsan"
  }
}
```

### 成员管理模块

#### GET /members/getmembers

获取宿舍成员列表

**响应**:

```json
{
  "code": "200",
  "message": "获取成员列表成功",
  "data": [
    {
      "memberId": 1,
      "name": "张三",
      "birthday": "2003-05-01",
      "hometown": "山东",
      "hobby": "篮球",
      "role": "舍长",
      "avatar": ""
    }
  ]
}
```

#### POST /members/addmembers

添加成员

**请求体**:

```json
{
  "name": "string",
  "birthday": "string",
  "hometown": "string",
  "hobby": "string",
  "role": "string",
  "avatar": "string"
}
```

**响应**:

```json
{
  "code": "200",
  "message": "成员添加成功"
}
```

### Flag 追踪模块

#### POST /flags/createFlag

创建Flag

**请求体**:

```json
{
  "title": "string",
  "content": "string",
  "needCheckin": boolean
}
```

**响应**:

```json
{
  "code": "200",
  "message": "Flag创建成功"
}
```

#### GET /flags/getFlags

获取Flag列表

**响应**:

```json
{
  "code": "200",
  "message": "获取Flag列表成功",
  "data": [
    {
      "flagId": 1,
      "title": "每天背50个单词",
      "content": "坚持每天背单词",
      "needCheckin": 1,
      "status": "active",
      "createTime": 1710307200000
    }
  ]
}
```

#### GET /flags/getFlagDetail?id={flagId}

获取Flag详情

**响应**:

```json
{
  "code": "200",
  "message": "获取Flag详情成功",
  "data": {
    "flagId": 1,
    "title": "每天背50个单词",
    "members": [{ "memberId": 1, "name": "张三" }],
    "checkinLogs": [{ "member": "张三", "date": "2026-03-12" }]
  }
}
```

#### POST /flags/checkinFlag

Flag打卡

**请求体**:

```json
{
  "flagId": number,
  "memberId": number
}
```

**响应**:

```json
{
  "code": "200",
  "message": "打卡成功"
}
```

#### POST /flags/deleteFlag

删除Flag（加入垃圾箱）

**请求体**:

```json
{
  "flagId": number
}
```

**响应**:

```json
{
  "code": "200",
  "message": "Flag已移入垃圾箱"
}
```

#### POST /flags/restoreFlag

恢复Flag

**请求体**:

```json
{
  "flagId": number
}
```

**响应**:

```json
{
  "code": "200",
  "message": "Flag恢复成功"
}
```

### 倒数日模块

#### POST /countdown/createCountdown

创建倒数日

**请求体**:

```json
{
  "title": "string",
  "targetDate": "string"
}
```

**响应**:

```json
{
  "code": "200",
  "message": "倒数日创建成功"
}
```

#### GET /countdown/getCountdowns

获取倒数日列表

**响应**:

```json
{
  "code": "200",
  "message": "获取倒数日成功",
  "data": [
    {
      "countdownId": 1,
      "title": "英语六级考试",
      "targetDate": "2026-06-15",
      "daysLeft": 95,
      "color": "yellow",
      "orderIndex": 1,
      "createTime": 1710307200000
    }
  ]
}
```

#### POST /countdown/updateCountdown

编辑倒数日

**请求体**:

```json
{
  "countdownId": number,
  "title": "string",
  "targetDate": "string"
}
```

**响应**:

```json
{
  "code": "200",
  "message": "倒数日修改成功"
}
```

#### POST /countdown/deleteCountdown

删除倒数日

**请求体**:

```json
{
  "countdownId": number
}
```

**响应**:

```json
{
  "code": "200",
  "message": "删除成功"
}
```

### 宿舍日志模块

#### POST /logs/createLog

创建宿舍日志

**请求体**:

```json
{
  "title": "string",
  "content": "string",
  "images": ["string"],
  "type": "string"
}
```

**响应**:

```json
{
  "code": "200",
  "message": "日志创建成功"
}
```

#### GET /logs/getLogs

获取日志列表或单个日志

**查询参数**:

- `id`: 可选，日志ID

**响应**:

```json
{
  "code": "200",
  "message": "获取日志成功",
  "data": {
    "logId": 1,
    "title": "宿舍聚餐",
    "content": "今天大家一起吃火锅",
    "images": ["img1.jpg"],
    "type": "聚餐",
    "createTime": 1710307200000
  }
}
```

#### POST /logs/deleteLog

删除日志

**请求体**:

```json
{
  "logId": number
}
```

**响应**:

```json
{
  "code": "200",
  "message": "日志删除成功"
}
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:8787` 启动。

### 运行测试

```bash
npm test
```

### 部署到 Cloudflare Workers

```bash
npm run deploy
```

## 环境变量

在 `.dev.vars` 文件中配置环境变量：

```
JWT_SECRET=your-secret-key
```

## 注意事项

1. 数据库文件 `dorm.db` 会在首次运行时自动创建
2. JWT Token 默认有效期为 7 天
3. 密码使用 bcrypt 加密存储
4. 所有 API 响应都遵循统一的 JSON 格式
5. CORS 已配置，允许跨域请求

## 开发阶段

当前已完成：**阶段一：系统设计与环境搭建**

- ✅ 后端项目基础框架
- ✅ 前端项目初始化工程
- ✅ 数据库表结构设计完成
- ✅ API路由框架搭建完成
- ✅ 所有后端API接口实现
- ✅ JWT身份认证
- ✅ SQLite数据库集成

下一阶段：**阶段二：后端核心功能开发**

- 用户系统模块
- 成员信息模块
- Flag追踪模块
- 倒数日模块
- 宿舍日志模块
