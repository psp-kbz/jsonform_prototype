import { rankWith, scopeEndsWith } from "@jsonforms/core";

export const ratingControlTester = rankWith(5, scopeEndsWith("rating"));
