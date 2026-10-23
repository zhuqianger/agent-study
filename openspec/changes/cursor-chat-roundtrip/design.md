# Design

## Context

见 proposal.md 的 Why。当前应用是 Next.js 16.4 App Router，`next.config.ts` 打开了 `cacheComponents`。`app/page.tsx` 仍是默认模板，没有 Route Handler，也没有 `@cursor/sdk`。`.gitignore` 已忽略 `.env*`。

本机 `next dev` 是长驻 Node 进程。Cursor SDK 的本地运行时会在该进程所在机器上、针对 `cwd` 启动 agent。本地运行必须显式传入模型。一次性调用用 `Agent.prompt`，它会在结束后自行释放资源。

POST Route Handler 不会被缓存。`route.ts` 不能和 `page.tsx` 放在同一个路由段，所以接口放在 `app/api/chat/route.ts`。

## Goals / Non-Goals

**Goals:**

- 浏览器提交一条提示，服务端阻塞到本地 agent 结束，再把最终文本一次性返回。
- API Key 只存在于服务端环境变量，并在调用 SDK 时显式传入。
- 启动失败和运行失败在 JSON 里用不同的 `phase` 区分，页面只展示 `message`。

**Non-Goals:**

- 流式输出、取消、多轮 `Agent.create` / `resume`、会话存储、云端运行时、模型选择 UI。
- 限制 agent 修改本仓库。提示以当前项目为工作目录执行。

## Decisions

### 一次性 `Agent.prompt`，并显式指定本地运行时

每次 POST 调用：

```ts
Agent.prompt(message, {
  apiKey: process.env.CURSOR_API_KEY,
  model: { id: process.env.CURSOR_MODEL ?? "composer-2.5" },
  local: { cwd: process.cwd() },
})
```

选它是因为本次没有追问。`Agent.prompt` 会自行 dispose。备选是 `Agent.create` 加 `send`，那是为了流式和多轮，这次用不上，还要自己保管句柄。

必须写 `local`。省略 `local` 和 `cloud` 时 SDK 会静默走本地，写上是为了让这个选择出现在代码里。云端需要仓库地址和另一套超时模型，留到以后的变更。

模型默认 `composer-2.5`。本地运行时模型是必填的。可用 `CURSOR_MODEL` 覆盖，避免在代码里再引入一套模型列表。

### JSON 契约

`POST /api/chat`，请求体 `{ "message": string }`。

- 成功 `200`：`{ "ok": true, "text": string }`。`text` 取 `result.result`。
- 空白提示 `400`：`{ "ok": false, "phase": "rejected", "message": string }`。在调用 SDK 之前返回。
- 没有 `CURSOR_API_KEY`，或抛出 `CursorAgentError`：`{ "ok": false, "phase": "startup", "message": string }`。
- `result.status === "error"`：`{ "ok": false, "phase": "run", "message": string }`。
- 其他未预期异常：同样用 `phase: "startup"`，消息为通用失败说明，不把异常对象原样塞进可能含密钥的字段。

响应不返回 `agentId`、`run.id` 或 API Key。服务端在 `prompt` 返回后把 `result.id` 和 `result.status` 打到日志，便于排查卡住或失败的运行。

### 页面拆成服务端页面加客户端表单

`app/page.tsx` 换成提示页。输入、等待和结果放在带 `"use client"` 的组件里，因为需要本地状态。等待时禁用提交。成功结果用保留换行的样式替换上一则回复。空白输入在浏览器里拦住，不发请求。

`fetch("/api/chat")` 不设置短超时。用户会一直看到等待状态，直到响应回来或连接失败。

### 密钥只放在环境变量

开发时把 `CURSOR_API_KEY` 放进 `.env.local`。该文件已被 `.env*` 忽略。不新增会被忽略规则吃掉的 `.env.example`；在 README 里写这两个变量的名字和「去 Cursor Dashboard → Integrations 创建 key」。

## Risks / Trade-offs

- [一次运行可能要数分钟，浏览器和开发服务器会一直占着这条请求] → 本次接受。页面用等待状态说明正在运行。不按 Vercel 等短超时平台来验收。
- [本机没有可用的本地执行器，或 key 无效、带首尾空白] → `phase: "startup"` 把 SDK 错误消息展示出来。文档要求 key 无首尾空白。
- [Agent 可以读写本仓库] → 这是本地编码 agent 的行为。页面上用一句短说明告诉用户提示会作用在当前项目。
- [助手最终文本可能为空，例如工作主要发生在工具调用里] → 仍返回 `text: ""`，页面展示空结果。工具过程不在本次范围。
- [`@cursor/sdk` 处于公开 beta，`result.result` 的字段以安装到的版本为准] → 实现时对照已安装包的类型，不另写一套解析。
- [开发服务器热更新可能打断正在进行的 `Agent.prompt`] → 失败时用户再次提交即可。不做运行恢复。

## Migration Plan

替换首页并新增接口，没有既有数据要迁。回退就是恢复 `app/page.tsx` 并删除 `app/api/chat`。未提交的 `.env.local` 可保留。

## Open Questions

无。模型默认值和是否流式已经在本设计里定死，不留到实现时再选。
