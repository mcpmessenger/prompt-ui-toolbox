import React from "react";
import { Dialog, DialogContent, DialogTrigger, DialogOverlay } from "@/components/ui/dialog";
import { Settings2Icon } from "lucide-react";

export const SettingsModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [anthropicKey, setAnthropicKey] = React.useState<string>(() => localStorage.getItem("ANTHROPIC_API_KEY") || "");
  const [geminiKey, setGeminiKey] = React.useState<string>(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    const stored = localStorage.getItem("DARK_MODE");
    if (stored !== null) return stored === "true";
    return document.documentElement.classList.contains("dark");
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("DARK_MODE", String(darkMode));
  }, [darkMode]);

  const save = () => {
    localStorage.setItem("ANTHROPIC_API_KEY", anthropicKey);
    localStorage.setItem("GEMINI_API_KEY", geminiKey);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Settings"
          className="fixed top-4 right-4 p-2 rounded-full bg-background border hover:bg-accent transition-colors z-50"
        >
          <Settings2Icon className="h-5 w-5 text-foreground" />
        </button>
      </DialogTrigger>
      <DialogOverlay />
      <DialogContent className="max-w-md p-6 space-y-4 bg-card">
        <h2 className="text-lg font-semibold">Settings</h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Anthropic API Key</label>
          <input
            type="password"
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            className="w-full rounded-md border px-2 py-1 bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Gemini API Key</label>
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            className="w-full rounded-md border px-2 py-1 bg-background"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="darkmode"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
          <label htmlFor="darkmode" className="text-sm font-medium select-none">True Black Dark Mode</label>
        </div>
        <button
          onClick={save}
          className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/80"
        >
          Save
        </button>
      </DialogContent>
    </Dialog>
  );
}; 