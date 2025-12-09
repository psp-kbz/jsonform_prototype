import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import submitRoute from "./routes/submit";
import submissionsRoute from "./routes/submissions";
import eventsRoute from "./routes/events";

const app = new Hono();

// Enable CORS
app.use(
  "/*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Routes
app.route("/api/submit", submitRoute);
app.route("/api/submissions", submissionsRoute);
app.route("/api/events", eventsRoute);

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
