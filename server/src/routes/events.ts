import { Hono } from "hono";
import { stream } from "hono/streaming";
import { db } from "../db/index";
import { submissions } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const eventsRoute = new Hono();

// Server-Sent Events endpoint for async processing
eventsRoute.get("/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");

  return stream(c, async (stream) => {
    stream.onAbort(() => {
      console.log("Client disconnected:", sessionId);
    });

    // Set SSE headers
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    // Send initial connection message
    await stream.write(
      `data: ${JSON.stringify({ type: "connected", sessionId })}\n\n`
    );

    // Simulate processing time (15 seconds as per README)
    await new Promise((resolve) => setTimeout(resolve, 15000));

    try {
      // Get the submitted data (in real app, this would be from a queue)
      // For now, we'll just get the latest submission for this session
      const [latestSubmission] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.sessionId, sessionId))
        .orderBy(desc(submissions.createdAt))
        .limit(1);

      if (latestSubmission) {
        // Send completion message
        await stream.write(
          `data: ${JSON.stringify({
            type: "complete",
            message: "Data saved to database",
            sessionId,
          })}\n\n`
        );
      } else {
        // No data found, but processing complete
        await stream.write(
          `data: ${JSON.stringify({
            type: "complete",
            message: "Processing complete",
            sessionId,
          })}\n\n`
        );
      }
    } catch (error) {
      console.error("Error in SSE processing:", error);
      await stream.write(
        `data: ${JSON.stringify({
          type: "error",
          message: "Processing failed",
          sessionId,
        })}\n\n`
      );
    }

    await stream.close();
  });
});

export default eventsRoute;
