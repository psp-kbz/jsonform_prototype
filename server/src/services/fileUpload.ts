import { createUploadthing, type FileRouter } from "uploadthing/server";
import { UTApi } from "uploadthing/server";
import "dotenv/config";

const f = createUploadthing();

// Initialize UploadThing API instance for server-side uploads
export const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});

export const uploadRouter = {
  fileUploader: f({ 
    image: { maxFileSize: "4MB" },
    pdf: { maxFileSize: "8MB" }
  }).onUploadComplete(async ({ file }) => {
    console.log("Upload complete:", file.url);
    return { url: file.url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
