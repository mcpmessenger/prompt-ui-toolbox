import React, { useEffect, useRef, useState } from "react";
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
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentInput, setCurrentInput] = useState("");

  useEffect(() => {
    if (!containerRef.current) return;
    console.log(`Initializing terminal for ${sessionKey}`); // Debug log
    // Determine theme colors for visibility
    const isDark = document.documentElement.classList.contains("dark");
    const bgColor = isDark ? "#000000" : "#ffffff";
    const fgColor = isDark ? "#ffffff" : "#000000";
    const term = new Terminal({
      convertEol: true,
      fontFamily: "monospace",
      theme: {
        background: bgColor,
        foreground: fgColor,
      },
    });
    console.log(`Terminal created:`, term); // Debug log
    term.open(containerRef.current);
    console.log(`Terminal opened in container`); // Debug log
    term.focus();
    console.log(`Terminal focused`); // Debug log
    termRef.current = term;

    const backendHost = `${window.location.hostname}:8000`;
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${wsProtocol}://${backendHost}/ws-shell/${sessionKey}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      console.log(`Received: ${JSON.stringify(e.data)}`); // Debug log
      console.log(`Terminal ref:`, termRef.current); // Debug log
      console.log(`Writing to terminal: ${JSON.stringify(e.data)}`); // Debug log
      term.write(e.data as string);
      console.log(`Write completed`); // Debug log
    };
    ws.onopen = () => {
      console.log(`WebSocket connected for ${sessionKey}`); // Debug log
    };
    ws.onerror = (e) => {
      console.error(`WebSocket error for ${sessionKey}:`, e); // Debug log
    };
    ws.onclose = () => {
      console.log(`WebSocket closed for ${sessionKey}`); // Debug log
    };

    term.onData((data) => ws.send(data));

    return () => {
      ws.close();
      term.dispose();
    };
  }, [sessionKey]);

  // Note: Removed runtime MutationObserver that updated xterm options, since
  // assigning to `term.options` after construction triggers xterm runtime
  // errors (immutable constructor-only properties). Instead, the terminal
  // theme is set once during creation based on the current color scheme.
  // If users toggle themes at runtime, they can refresh the pane to apply
  // new colors without disrupting the session.

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cmd = formData.get("message") as string;
    if (!cmd) return;
    
    // Add to command history
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setCurrentInput("");
    
    // local echo
    termRef.current?.writeln(`> ${cmd}`);
    console.log(`Sending command: ${JSON.stringify(cmd + "\n")}`); // Debug log
    wsRef.current?.send(cmd + "\n");
    (e.currentTarget.elements.namedItem("message") as HTMLInputElement).value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) {
        form.requestSubmit();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        const command = commandHistory[commandHistory.length - 1 - newIndex];
        setCurrentInput(command);
        e.currentTarget.value = command;
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const command = commandHistory[commandHistory.length - 1 - newIndex];
        setCurrentInput(command);
        e.currentTarget.value = command;
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput("");
        e.currentTarget.value = "";
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 py-1 font-semibold border-b text-sm">{title}</div>
      <div ref={containerRef} className="flex-1 w-full h-full overflow-hidden bg-white text-black dark:bg-black dark:text-white" />
      <form onSubmit={handleSubmit} className="pt-1">
        <PromptBox 
          name="message" 
          onKeyDown={handleKeyDown}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
        />
      </form>
    </div>
  );
}; 