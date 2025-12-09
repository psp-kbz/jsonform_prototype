import { Hono } from "hono";
import { createRouteHandler } from "uploadthing/server";
import { uploadRouter } from "../services/fileUpload";

const uploadRoute = new Hono();

// Create UploadThing handler
const handler = createRouteHandler({
  router: uploadRouter,
});

// Handle both GET and POST requests
uploadRoute.all("/", async (c) => {
  const req = c.req.raw;
  const res = await handler(req);
  return res;
});

export default uploadRoute;
