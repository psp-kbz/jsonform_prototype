import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import submitRoute from "./routes/submit";
import submissionsRoute from "./routes/submissions";
import eventsRoute from "./routes/events";
import uploadRoute from "./routes/upload";

const app = new Hono();

// Enable CORS
app.use(
  "/*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://literate-space-xylophone-7vrjppgvwjgjhp9wj-3000.app.github.dev"
    ],
    credentials: true,
  })
);

// Routes
app.route("/api/submit", submitRoute);
app.route("/api/submissions", submissionsRoute);
app.route("/api/events", eventsRoute);
app.route("/api/uploadthing", uploadRoute);

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

const port = 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
