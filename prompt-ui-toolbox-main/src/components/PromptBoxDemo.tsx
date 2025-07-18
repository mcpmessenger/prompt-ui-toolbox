
import React, { useEffect, useRef, useState } from "react";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import { ThemeToggle } from "@/components/ThemeToggle";

export function PromptBoxDemo() {
  const [messages, setMessages] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to the PM agent by default. Adjust if you want other agents.
    const ws = new WebSocket("ws://localhost:8000/ws/pm");
    wsRef.current = ws;

    ws.onmessage = (e) => {
      setMessages((prev) => [...prev, e.data as string]);
    };

    ws.onerror = console.error;

    return () => ws.close();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = formData.get("message") as string;
    if (!message) return;

    // Display the outgoing message locally
    setMessages((prev) => [...prev, `> ${message}`]);

    // Send to backend
    wsRef.current?.send(message);

    // Reset the input field
    (event.currentTarget.elements.namedItem("message") as HTMLInputElement).value = "";
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background dark:bg-black p-4">
      <ThemeToggle />
      <div className="w-full max-w-xl flex flex-col gap-10">
        <p className="text-center text-3xl text-foreground">
          How Can I Help You
        </p>
        <form onSubmit={handleSubmit}>
          <PromptBox name="message" />
        </form>

        {messages.length > 0 && (
          <div className="bg-muted p-4 rounded-md space-y-1 text-sm">
            {messages.map((m, idx) => (
              <div key={idx}>{m}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
