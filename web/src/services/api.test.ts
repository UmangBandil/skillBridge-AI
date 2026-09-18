import { describe, expect, it } from "vitest";
import { normalizeTaskSkills } from "./api";

describe("normalizeTaskSkills", () => {
  it("normalizes comma-separated skills", () => {
    expect(normalizeTaskSkills(" React, TypeScript, , Node.js ")).toEqual([
      "React",
      "TypeScript",
      "Node.js",
    ]);
  });

  it("normalizes an array and safely handles missing values", () => {
    expect(normalizeTaskSkills([" React ", "", "TypeScript"])).toEqual([
      "React",
      "TypeScript",
    ]);
    expect(normalizeTaskSkills(undefined)).toEqual([]);
  });
});
