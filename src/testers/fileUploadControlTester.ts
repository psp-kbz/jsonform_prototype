import { rankWith, and, uiTypeIs, formatIs } from "@jsonforms/core";

export const fileUploadControlTester = rankWith(
  5,
  and(uiTypeIs("Control"), formatIs("data-url"))
);
