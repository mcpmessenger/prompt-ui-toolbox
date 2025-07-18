import React, { useState, useEffect, useRef } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { SettingsModal } from "@/components/SettingsModal";
import { TerminalPane } from "@/components/TerminalPane";

export const MultiAgentChat: React.FC = () => {
  return (
    <div className="h-screen w-screen p-4">
      <SettingsModal />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={40} minSize={20} className="hide-scrollbar">
          <TerminalPane sessionKey="pm" title="Project Manager" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={20} className="hide-scrollbar">
          <TerminalPane sessionKey="frontend" title="Frontend" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={20} className="hide-scrollbar">
          <TerminalPane sessionKey="backend" title="Backend" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}; 