# ourDorm 本地 API 文档（localhost:3000）

## 0. 基本信息

- Base URL: `http://localhost:3000`
- 本地启动：`npm run dev:local`
- 测试账号：`admin / admin123`（见 `src/server.ts` 输出）

### 统一响应格式
后端返回基本为：

```json
{
  "code": "200",
  "message": "xxx",
  "data": {}
}
鉴权（JWT）
需要登录态的接口必须携带请求头：

Authorization: Bearer <JWT>
注意：

不要写成 Bearer <eyJ...>（不要带尖括号）
不要加引号、不要换行、不要把 token 分段复制
1) Auth
1.1 注册
POST /auth/register
Auth：否
Body(JSON)：
{ "username": "test", "password": "123456" }
成功响应示例：
{ "code": "200", "message": "注册成功" }
1.2 登录
POST /auth/login
Auth：否
Body(JSON)：
{ "username": "admin", "password": "admin123" }
成功响应示例（保存 JWT 用于后续接口）：
{ "code": "200", "message": "登录成功", "JWT": "eyJ..." }
1.3 获取当前用户
GET /auth/me
Auth：是（Bearer JWT）
Body：无
2) Members
2.1 获取成员列表
GET /members/getmembers
Auth：否
2.2 新增成员
POST /members/addmembers
Auth：是
Body(JSON)（name 必填，其余可选）：
{
  "name": "张三",
  "birthday": "2003-05-01",
  "hometown": "山东",
  "hobby": "篮球",
  "role": "舍长",
  "avatar": null
}
2.3 更新成员
POST /members/updateMember
Auth：是
Body(JSON)（memberId、name 必填）：
{
  "memberId": 1,
  "name": "张三",
  "birthday": "2003-05-01",
  "hometown": "山东",
  "hobby": "篮球",
  "role": "舍长",
  "avatar": null
}
2.4 删除成员
POST /members/deleteMember
Auth：是
Body(JSON)：
{ "memberId": 1 }
3) Flags
3.1 创建 Flag
POST /flags/createFlag
Auth：是
Body(JSON)（title 必填；needCheckin boolean；memberIds 可选）：
{
  "title": "每天背10个单词",
  "content": "坚持",
  "needCheckin": true,
  "memberIds": [1, 2]
}
响应里会返回 data.flagId。

3.2 获取 Flag 列表
GET /flags/getFlags
Auth：否
3.3 获取 Flag 详情
GET /flags/getFlagDetail?id=<flagId>
Auth：否
参数：query id 必填
示例：/flags/getFlagDetail?id=1
3.4 获取回收站 Flag 列表
GET /flags/getTrashFlags
Auth：是
3.5 打卡 Flag
POST /flags/checkinFlag
Auth：是
Body(JSON)：
{ "flagId": 1, "memberId": 1 }
3.6 软删除 Flag（进回收站）
POST /flags/deleteFlag
Auth：是
Body(JSON)：
{ "flagId": 1 }
3.7 恢复 Flag
POST /flags/restoreFlag
Auth：是
Body(JSON)：
{ "flagId": 1 }
3.8 更新 Flag
POST /flags/updateFlag
Auth：是
Body(JSON)（flagId、title 必填；memberIds 如果传入会整体覆盖参与成员）：
{
  "flagId": 1,
  "title": "新标题",
  "content": "新内容",
  "needCheckin": true,
  "memberIds": [1, 3]
}
3.9 彻底删除 Flag
POST /flags/permanentlyDeleteFlag
Auth：是
Body(JSON)：
{ "flagId": 1 }
4) Countdown
4.1 创建倒计时
POST /countdown/createCountdown
Auth：是
Body(JSON)：
{ "title": "四级考试", "targetDate": "2026-06-20" }
4.2 获取倒计时列表
GET /countdown/getCountdowns
Auth：否
说明：返回里包含派生字段 daysLeft、color（green/yellow/red）
4.3 更新倒计时
POST /countdown/updateCountdown
Auth：是
Body(JSON)：
{ "countdownId": 1, "title": "四级考试", "targetDate": "2026-06-20" }
4.4 删除倒计时
POST /countdown/deleteCountdown
Auth：是
Body(JSON)：
{ "countdownId": 1 }
5) Logs
5.1 创建日志
POST /logs/createLog
Auth：是
Body(JSON)（title 必填；images 数组；type 可选）：
{
  "title": "标题",
  "content": "内容",
  "images": [],
  "type": "日常"
}
5.2 获取日志列表 / 单条日志
GET /logs/getLogs
Auth：否
获取单条：

GET /logs/getLogs?id=<logId>
示例：/logs/getLogs?id=1
5.3 更新日志
POST /logs/updateLog
Auth：是
Body(JSON)（logId、title 必填；其余可选）：
{
  "logId": 1,
  "title": "新标题",
  "content": "新内容",
  "images": [],
  "type": "日常"
}
5.4 删除日志
POST /logs/deleteLog
Auth：是
Body(JSON)：
{ "logId": 1 }
常见坑（你已经踩过）
JSON 最后一项不要尾逗号，否则后端 req.json() 解析会报错。
GET 接口参数用 query（例如 .../getLogs?id=1），不要用 Body。
Bearer token 不要带 < >、引号、换行。

