"use client";

import { useState, type FormEvent } from "react";

type ChatSuccess = {
  ok: true;
  text: string;
};

type ChatFailure = {
  ok: false;
  phase: "rejected" | "startup" | "run";
  message: string;
};

export function PromptForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }
    if (message.trim() === "") {
      setHint("请输入内容。");
      return;
    }

    setHint(null);
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      let body: ChatSuccess | ChatFailure | null = null;
      try {
        body = (await response.json()) as ChatSuccess | ChatFailure;
      } catch {
        body = null;
      }
      if (body?.ok) {
        setReply(body.text);
        setError(null);
      } else {
        setError(body?.message || "请求失败，请再试一次。");
      }
    } catch {
      setError("请求失败，请再试一次。");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="prompt">
        提示
        <textarea
          id="prompt"
          name="message"
          value={message}
          rows={6}
          disabled={pending}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full resize-y rounded-lg border border-black/10 bg-transparent px-3 py-2 text-base font-normal outline-none focus:border-black/30 disabled:opacity-60 dark:border-white/15 dark:focus:border-white/40"
        />
      </label>
      {hint ? (
        <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-fit rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "正在运行…" : "发送"}
      </button>
      {pending ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          正在等待 Cursor agent 返回。
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="whitespace-pre-wrap text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
      {reply !== null ? (
        <pre className="whitespace-pre-wrap font-sans text-base">{reply}</pre>
      ) : null}
    </form>
  );
}
