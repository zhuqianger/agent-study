# Spec Delta

## Purpose

服务端用调用方自己的 Cursor 凭证，对当前项目发起一次本地 agent 运行，并把最终助手文本交回调用方，且不泄露凭证。

## ADDED Requirements

### Requirement: Return the final assistant text
服务端 SHALL 接受一条非空提示，针对当前项目发起一次本地 agent 运行，并在运行结束后返回最终助手文本。响应 MUST NOT 包含 API Key。

#### Scenario: Run finishes with assistant text
- **WHEN** 调用方提交一条非空提示且运行正常结束
- **THEN** 响应包含该次运行的最终助手文本，且不包含 API Key

### Requirement: Reject an empty prompt
服务端 MUST 拒绝空提示或只含空白的提示，且 MUST NOT 为此启动 agent。

#### Scenario: Blank prompt
- **WHEN** 调用方提交空字符串或只含空白的提示
- **THEN** 服务端返回失败，且不启动 agent

### Requirement: Report a missing credential
未配置 API Key 时，服务端 MUST 返回失败说明，且 MUST NOT 启动 agent。失败说明 MUST NOT 回显密钥值。

#### Scenario: API key is absent
- **WHEN** 调用方提交非空提示且服务端没有可用的 API Key
- **THEN** 服务端返回失败说明，且不启动 agent

### Requirement: Separate startup failure from run failure
agent 未能开始运行时，服务端 SHALL 返回可与「运行已开始但中途失败」区分的失败说明。两种说明都 MUST NOT 包含 API Key。

#### Scenario: Agent never starts
- **WHEN** 提示非空且凭证存在，但 agent 在开始运行前失败
- **THEN** 响应标明运行未开始，并带有失败说明

#### Scenario: Run starts then fails
- **WHEN** agent 已经开始运行但未成功结束
- **THEN** 响应标明运行已开始但失败，并带有失败说明

### Requirement: Each request is independent
服务端 MUST 把每一次调用当作一次新的运行。调用方不需要、也 MUST NOT 被要求提供上一次的会话标识。

#### Scenario: Two prompts in sequence
- **WHEN** 调用方先后提交两条不同的提示
- **THEN** 第二次运行不依赖调用方保存第一次的会话标识
