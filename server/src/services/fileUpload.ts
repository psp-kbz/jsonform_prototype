import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("Upload complete:", file.url);
      return { url: file.url };
    }
  ),
  pdfUploader: f({ pdf: { maxFileSize: "8MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("Upload complete:", file.url);
      return { url: file.url };
    }
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
