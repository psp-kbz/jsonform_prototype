import { Hono } from "hono";
import { stream } from "hono/streaming";
import { db } from "../db/index";
import { submissions } from "../db/schema";
import { utapi } from "../services/fileUpload";
import { pendingSubmissions } from "./submit";

const eventsRoute = new Hono();

// Helper function to upload file
const uploadFile = async (file: File): Promise<string | null> => {
  try {
    const uploaded = await utapi.uploadFiles(file);
    return uploaded.data?.url || null;
  } catch (err) {
    console.error("File upload error:", err);
    return null;
  }
};

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

    // Get pending submission
    const pending = pendingSubmissions.get(sessionId);
    if (!pending) {
      await stream.write(
        `data: ${JSON.stringify({
          type: "error",
          message: "Session not found",
        })}\n\n`
      );
      await stream.close();
      return;
    }

    let data = pending.data;
    const uploadedUrls: string[] = [];

    // Upload files if present
    if (pending.formData) {
      for (const [key, value] of pending.formData.entries()) {
        if (key !== "data" && key !== "schema" && key !== "sessionId" && value instanceof File) {
          const url = await uploadFile(value);
          if (!url) {
            await stream.write(
              `data: ${JSON.stringify({
                type: "error",
                message: "File upload failed",
              })}\n\n`
            );
            pendingSubmissions.delete(sessionId);
            await stream.close();
            return;
          }
          data[key] = url;
          uploadedUrls.push(url);
        }
      }
    }

    // Simulate processing time (7 seconds after upload)
    await new Promise((resolve) => setTimeout(resolve, 7000));

    try {
      // Store in database with uploaded file URLs
      await db.insert(submissions).values({
        sessionId,
        formData: data,
      });

      // Clean up pending submission
      pendingSubmissions.delete(sessionId);

      // Send completion message
      await stream.write(
        `data: ${JSON.stringify({
          type: "complete",
          message: "Processing completed successfully!",
          sessionId,
        })}\n\n`
      );
    } catch (error) {
      console.error("Error in SSE processing:", error);
      
      // Clean up pending submission
      pendingSubmissions.delete(sessionId);

      await stream.write(
        `data: ${JSON.stringify({
          type: "error",
          message: "Database insert failed",
          sessionId,
        })}\n\n`
      );
    }

    await stream.close();
  });
});

export default eventsRoute;
