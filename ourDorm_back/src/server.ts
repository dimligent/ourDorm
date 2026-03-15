import { serve } from "@hono/node-server";
import app from "./local-index.ts";

const port = 3000;

console.log(`🚀 723宿舍官网API服务已启动`);
console.log(`📍 本地地址: http://localhost:${port}`);
console.log(`📝 测试账号: admin / admin123`);

serve({
  fetch: app.fetch,
  port,
});
