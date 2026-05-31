import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Initialize GoogleGenAI client on the server side
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not set in the environment.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Secure server-side Gemini route
app.post("/api/ai/ask", async (req, res) => {
  const { prompt, systemInstruction, temperature } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Missing prompt field inside request body." });
    return;
  }

  const client = getAiClient();
  if (!client) {
    res.status(500).json({
      error: "Gemini API client is not initialized. Please verify that your GEMINI_API_KEY is properly set in the Secrets manager."
    });
    return;
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are an expert backend Python developer specialized in FastAPI, SQLAlchemy, PostgreSQL, and industry security patterns.",
        temperature: temperature || 0.2,
      },
    });

    res.json({
      reply: response.text || "Sorry, I generated an empty response.",
    });
  } catch (error: any) {
    console.error("Gemini invocation failed:", error);
    res.status(500).json({
      error: error.message || "An error occurred while invoking the Gemini server-side SDK."
    });
  }
});

// Setting up dev server versus production build paths
async function startWebApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Correct production path resolving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting of Event API System on http://localhost:${PORT}`);
  });
}

startWebApp().catch(err => {
  console.error("Critical error while starting Express dev server:", err);
});
