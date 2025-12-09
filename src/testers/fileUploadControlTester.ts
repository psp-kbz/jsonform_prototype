import { rankWith, scopeEndsWith } from "@jsonforms/core";

export const fileUploadControlTester = rankWith(
  5,
  scopeEndsWith("profilePicture")
);
