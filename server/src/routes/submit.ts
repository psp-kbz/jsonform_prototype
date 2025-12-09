import { Hono } from "hono";
import { db } from "../db/index";
import { submissions } from "../db/schema";
import { z } from "zod";

const submitRoute = new Hono();

const FormDataSchema = z.record(z.any());

// Handle form submission
submitRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { data, sessionId } = body;

    // Validate data
    const validatedData = FormDataSchema.parse(data);

    // Store in database
    await db.insert(submissions).values({
      sessionId,
      formData: validatedData,
    });

    console.log("Received submission for session:", sessionId);

    // Return immediate response
    return c.json({
      success: true,
      message: "Form submitted successfully",
      sessionId,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return c.json(
      {
        success: false,
        message: "Failed to submit form",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      400
    );
  }
});

export default submitRoute;
