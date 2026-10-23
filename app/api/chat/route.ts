import { Agent, CursorAgentError } from "@cursor/sdk";

type ChatSuccess = {
  ok: true;
  text: string;
};

type ChatFailure = {
  ok: false;
  phase: "rejected" | "startup" | "run";
  message: string;
};

function json(body: ChatSuccess | ChatFailure, status: number) {
  return Response.json(body, { status });
}

function redact(message: string, secret: string) {
  return message.split(secret).join("[redacted]");
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json(
      { ok: false, phase: "rejected", message: "请求体不是合法的 JSON。" },
      400,
    );
  }

  const message =
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
      ? payload.message
      : null;

  if (message === null || message.trim() === "") {
    return json({ ok: false, phase: "rejected", message: "请输入内容。" }, 400);
  }

  const apiKey = process.env.CURSOR_API_KEY?.trim() ?? "";
  if (!apiKey) {
    return json(
      {
        ok: false,
        phase: "startup",
        message: "服务端未配置 CURSOR_API_KEY。",
      },
      500,
    );
  }

  const modelId = process.env.CURSOR_MODEL?.trim() || "composer-2.5";

  try {
    const result = await Agent.prompt(message, {
      apiKey,
      model: { id: modelId },
      local: { cwd: process.cwd() },
    });
    console.info("cursor run", result.id, result.status);

    if (result.status !== "finished") {
      const detail = result.error?.message ?? "Agent 运行失败。";
      return json(
        { ok: false, phase: "run", message: redact(detail, apiKey) },
        500,
      );
    }

    return json({ ok: true, text: result.result ?? "" }, 200);
  } catch (error) {
    if (error instanceof CursorAgentError) {
      return json(
        {
          ok: false,
          phase: "startup",
          message: redact(error.message, apiKey),
        },
        500,
      );
    }
    console.error("cursor prompt failed to start");
    return json(
      { ok: false, phase: "startup", message: "Agent 未能启动。" },
      500,
    );
  }
}
