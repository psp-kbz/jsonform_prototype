import { Hono } from "hono";
import { db } from "../db/index";
import { submissions } from "../db/schema";
import { desc } from "drizzle-orm";

const submissionsRoute = new Hono();

// Get all submissions
submissionsRoute.get("/", async (c) => {
  try {
    const allSubmissions = await db
      .select()
      .from(submissions)
      .orderBy(desc(submissions.createdAt));

    return c.json({
      success: true,
      data: allSubmissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch submissions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default submissionsRoute;
