# Tasks

## 1. 依赖与说明

- [x] 1.1 安装 `@cursor/sdk`，并核对 `package.json` 与锁文件已包含该依赖，且包导出 `Agent` 与 `CursorAgentError`
- [x] 1.2 在 README 写明 `CURSOR_API_KEY`（Cursor Dashboard → Integrations）和可选的 `CURSOR_MODEL`，并核对文档没有写入真实密钥

## 2. 一次性调用接口

- [x] 2.1 新增 `app/api/chat/route.ts`：校验非空 `message`，用 `Agent.prompt` 显式传入 `apiKey`、`model` 和 `local.cwd`，按 design.md 的 JSON 契约返回 `ok` / `text` 或 `phase` / `message`，并在服务端日志记下 `result.id` 与 `result.status`。用 `npx tsc --noEmit` 确认类型通过，且响应类型不包含 API Key 字段
- [x] 2.2 对运行中的开发服务器发送空白 `message`，确认响应为 400、`phase` 为 `rejected`，且该请求不会调用 SDK
- [x] 2.3 在未设置 `CURSOR_API_KEY` 时发送非空 `message`，确认响应的 `phase` 为 `startup`，且响应体不包含密钥字样

## 3. 提示页

- [x] 3.1 新增客户端表单：非空才 `POST /api/chat`，等待时禁止再次提交，成功时用保留换行的样式替换上一则全文，失败时展示 `message`。在浏览器中确认空白提交不发出请求，且等待时提交控件不可用
- [x] 3.2 用该表单替换 `app/page.tsx` 的默认模板，并在页面上说明提示会作用在当前项目。打开首页确认能看到输入区和这句说明

## 4. 端到端

- [x] 4.1 在 `.env.local` 配置有效的 `CURSOR_API_KEY` 后重启 `next dev`，从页面提交一条不改代码的短提示（例如要求只回复一个词），确认等待结束后页面展示助手全文。若运行失败，确认页面展示的是失败说明而不是密钥

## Workflow follow-up

- 实现与验收完成后，再归档这个 change。
- 归档后核对 spec 已进入 `openspec/specs/`。
