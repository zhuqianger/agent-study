# Proposal

## Why

仓库目前只有 Next.js 默认首页，无法从页面把一句话交给 Cursor agent 并看到回复。先打通「输入一次、等完整结果、显示出来」这条链路，后面的流式输出和多轮会话才有基础。

## What Changes

- 用一个提示输入页替换默认首页：单行或多行输入、提交、等待、展示助手全文或错误。
- 新增一个 POST 接口。服务端读取 `CURSOR_API_KEY`，用 Cursor TypeScript SDK 的一次性 `Agent.prompt` 在本机、针对本仓库工作目录运行 agent，把最终助手文本返回给浏览器。
- 请求在 agent 跑完之前保持打开，不做流式推送。
- 浏览器不接触 API Key，也不接收 agent id、运行 id 以外的密钥材料。响应只包含可展示的文本和失败说明。

本次不做：多轮上下文、会话列表、流式输出、取消、模型选择器、云端 agent、登录、把结果持久化。

## Capabilities

### New Capabilities

- `prompt-submission`: 用户提交一条非空提示，在等待结束后看到助手全文或可读的失败说明。
- `cursor-one-shot`: 服务端用本机 API Key 对当前仓库发起一次本地 agent 运行，并返回最终文本。

### Modified Capabilities

- 无。项目里还没有已发布的 spec。

## Impact

- `app/page.tsx` 从默认模板改为提示页；交互放在客户端组件里。
- 新增 `app/api/chat/route.ts`（与 `page.tsx` 不能放在同一路由段）。
- 新增依赖 `@cursor/sdk`。密钥放在已被 gitignore 的 `.env*` 中，例如 `.env.local` 的 `CURSOR_API_KEY`。
- 运行前提是本机执行 `next dev`，并且本机能启动 Cursor 本地 agent。该接口可能阻塞数十秒到数分钟，不按短超时的 serverless 部署来设计。
- Agent 以本仓库为工作目录，提示内容可以让它读取或修改项目文件。这是本地编码 agent 的固有行为，本次不额外加沙箱。
