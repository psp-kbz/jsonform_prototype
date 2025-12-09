import { rankWith, and, scopeEndsWith, schemaMatches } from "@jsonforms/core";

export const ageSliderControlTester = rankWith(
  5,
  and(
    scopeEndsWith("age"),
    schemaMatches((schema) => schema.type === "number" || schema.type === "integer")
  )
);
