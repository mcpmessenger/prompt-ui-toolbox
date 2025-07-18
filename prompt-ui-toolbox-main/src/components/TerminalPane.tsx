import React, { useEffect, useRef } from "react";
// @ts-ignore - xterm types added via devDependency
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";

interface TerminalPaneProps {
  sessionKey: string;
  title: string;
}

export const TerminalPane: React.FC<TerminalPaneProps> = ({ sessionKey, title }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const term = new Terminal({
      convertEol: true,
      fontFamily: "monospace",
      theme: {
        background: document.documentElement.classList.contains("dark") ? "#000000" : "#ffffff",
      },
    });
    term.open(containerRef.current);
    term.focus();
    termRef.current = term;

    const backendHost = `${window.location.hostname}:8000`;
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${wsProtocol}://${backendHost}/ws-shell/${sessionKey}`);
    wsRef.current = ws;

    ws.onmessage = (e) => term.write(e.data as string);
    ws.onerror = console.error;

    term.onData((data) => ws.send(data));

    return () => {
      ws.close();
      term.dispose();
    };
  }, [sessionKey]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cmd = formData.get("message") as string;
    if (!cmd) return;
    // local echo
    termRef.current?.writeln(`> ${cmd}`);
    wsRef.current?.send(cmd + "\n\r");
    (e.currentTarget.elements.namedItem("message") as HTMLInputElement).value = "";
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 py-1 font-semibold border-b text-sm">{title}</div>
      <div ref={containerRef} className="flex-1 w-full h-full overflow-hidden bg-[#f6f6f6] text-black dark:bg-black dark:text-white" />
      <form onSubmit={handleSubmit} className="pt-1">
        <PromptBox name="message" />
      </form>
    </div>
  );
}; 