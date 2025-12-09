import { rankWith, and, schemaMatches } from "@jsonforms/core";

export const fileUploadControlTester = rankWith(
  10,
  and(
    schemaMatches((schema) => schema.format === "data-url" || schema.contentMediaType !== undefined)
  )
);
