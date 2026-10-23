import type { Metadata } from "next";
import { PromptForm } from "./prompt-form";

export const metadata: Metadata = {
  title: "Cursor 提示",
  description: "把一条提示交给当前项目的 Cursor agent",
};

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Cursor 提示</h1>
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
            提示会作用在当前项目。Agent 可以读取或修改这个仓库里的文件。
          </p>
        </div>
        <PromptForm />
      </main>
    </div>
  );
}
