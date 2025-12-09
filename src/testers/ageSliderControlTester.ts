import { rankWith, scopeEndsWith } from "@jsonforms/core";

export const ageSliderControlTester = rankWith(5, scopeEndsWith("age"));
