import { Hono } from "hono";
import { z } from "zod";

const submitRoute = new Hono();

const FormDataSchema = z.record(z.any());

// Store pending submissions in memory
export const pendingSubmissions = new Map<
  string,
  { data: any; schema: any; formData?: FormData }
>();

// Handle form submission
submitRoute.post("/", async (c) => {
  try {
    const contentType = c.req.header("content-type") || "";
    let data: any;
    let schema: any;
    let sessionId: string;
    let formData: FormData | null = null;

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData (with files)
      formData = await c.req.formData();
      schema = JSON.parse(formData.get("schema") as string);
      data = JSON.parse(formData.get("data") as string);
      sessionId = formData.get("sessionId") as string;
    } else {
      // Handle JSON
      const body = await c.req.json();
      data = body.data;
      schema = body.schema;
      sessionId = body.sessionId;
    }

    // Validate data (excluding File objects)
    const validatedData = FormDataSchema.parse(data);

    // Store in pending submissions map for SSE processing
    pendingSubmissions.set(sessionId, {
      data: validatedData,
      schema,
      formData: formData || undefined,
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
