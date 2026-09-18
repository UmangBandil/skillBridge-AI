import { describe, expect, it } from "vitest";
import { parseResume, parseResumeFallback } from "./parser.js";

describe("resume parser", () => {
  it("returns a stable empty shape for invalid input", async () => {
    await expect(parseResume("")).resolves.toMatchObject({
      skills: [],
      education: [],
      experience: [],
      skillCount: 0,
      hasEducation: false,
      hasExperience: false,
    });
  });

  it("extracts skills, sections, and contact details without OpenAI", async () => {
    const resume = `Jane Doe
Email: jane@example.com
SKILLS
React, TypeScript, PostgreSQL
EXPERIENCE
Frontend Engineer at Example
EDUCATION
Computer Science BSc`;

    const parsed = parseResumeFallback(resume);

    expect(parsed.skills).toEqual(expect.arrayContaining(["react", "typescript", "postgresql"]));
    expect(parsed.contact.email).toBe("jane@example.com");
    expect(parsed.experience).toContain("Frontend Engineer at Example");
    expect(parsed.education).toContain("Computer Science BSc");
    expect(parsed.skillCount).toBe(parsed.skills.length);
  });
});
