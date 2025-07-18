import express from "express";
import { spawn } from "child_process";

const PORT = process.env.PORT || 9000;
const app = express();
app.use(express.json());

app.post("/execute", (req, res) => {
  const prompt = req.body?.input ?? "";
  const key = req.body?.apiKey || process.env.GEMINI_API_KEY;
  if (!key) return res.status(400).json({ error: "No API key" });
  const env = { ...process.env, GEMINI_API_KEY: key };
  const child = spawn("gemini-cli", ["--no-color"], { env, stdio: ["pipe", "pipe", "pipe"] });
  let out = "";
  child.stdout.on("data", d => (out += d));
  child.stderr.on("data", d => (out += d));
  child.stdin.write(prompt + "\n");
  child.stdin.end();
  child.on("close", () => res.json({ output: out.trim() }));
});

app.listen(PORT, () => console.log("Gemini agent ready on", PORT)); 