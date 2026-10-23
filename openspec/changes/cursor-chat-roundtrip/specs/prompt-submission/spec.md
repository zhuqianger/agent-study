# Spec Delta

## Purpose

让使用网页的人提交一条非空提示，在等待结束后看到助手返回的完整文本，或一条可以据以重试的失败说明。

## ADDED Requirements

### Requirement: Submit one prompt
页面 SHALL 提供文本输入和提交操作。用户提交一条包含非空白字符的提示后，系统 MUST 把该提示原样交给后端，并进入等待状态。

#### Scenario: Submit a non-empty prompt
- **WHEN** 用户输入包含非空白字符的提示并提交
- **THEN** 系统向后端发送这一条提示，并在结果返回前保持等待状态

### Requirement: Reject blank prompts locally
页面 MUST 拒绝只含空白的提示，且 MUST NOT 为此向后端发请求。

#### Scenario: Whitespace-only input
- **WHEN** 用户提交空字符串或只含空白的文本
- **THEN** 页面不发请求，并提示需要输入内容

### Requirement: Show the full reply
等待结束后，页面 SHALL 展示后端返回的助手全文。展示 MUST 保留换行。一次新的成功结果 MUST 替换上一次展示的回复。

#### Scenario: Successful reply replaces the previous one
- **WHEN** 后端返回成功和助手全文
- **THEN** 页面结束等待状态，并展示该全文，替换此前的回复

### Requirement: Show failures and allow another try
后端或网络失败时，页面 SHALL 展示可读的失败说明，并 MUST 允许用户再次提交。失败说明 MUST NOT 包含 API Key。

#### Scenario: Backend reports a failure
- **WHEN** 后端返回失败说明
- **THEN** 页面结束等待状态，展示该说明，并允许再次提交

#### Scenario: Request does not complete
- **WHEN** 请求在收到后端结果前失败
- **THEN** 页面结束等待状态，展示失败说明，并允许再次提交

### Requirement: One submission at a time
等待期间页面 MUST 阻止再次提交同一表单。

#### Scenario: Submit while waiting
- **WHEN** 一次提交仍在等待结果
- **THEN** 页面不接受新的提交
