// Seed script: populates the database with realistic micro-internships so the
// demo has meaningful data to match against.
//
// Usage:
//   npm run db:seed            # create demo author + tasks (skips existing titles)
//   npm run db:seed -- --clean # remove tasks created by the seed author first
//
// Env overrides:
//   SEED_AUTHOR_EMAIL     (default: recruiter@skillbridge.dev)
//   SEED_AUTHOR_PASSWORD  (default: password123)
//
// Idempotent: tasks whose title already exists are left untouched, so the
// script is safe to re-run. Requires DATABASE_URL (see server/.env) and a
// reachable PostgreSQL database.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { embed } from "../src/embed.js";

const prisma = new PrismaClient();

const SEED_AUTHOR_EMAIL = process.env.SEED_AUTHOR_EMAIL || "recruiter@skillbridge.dev";
const SEED_AUTHOR_PASSWORD = process.env.SEED_AUTHOR_PASSWORD || "password123";

const SEED_TASKS = [
  {
    title: "Design a brand kit for a wildlife conservation NGO",
    description:
      "Create a cohesive visual identity — logo variations, color palette, typography, and social media templates — for a grassroots wildlife conservation organization.",
    skills: ["Figma", "Adobe Illustrator", "Graphic Design", "Branding", "Typography"],
    budget: 3000,
  },
  {
    title: "Build a donation dashboard with Stripe",
    description:
      "Build a web dashboard where a nonprofit can track donations, view donor trends, and manage recurring giving. Integrate Stripe payments and a simple admin view.",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Stripe"],
    budget: 6000,
  },
  {
    title: "Analyze survey data for an education nonprofit",
    description:
      "Clean and analyze a 2,000-response student survey for an education nonprofit. Deliver insights on learning outcomes with charts and a short written summary.",
    skills: ["Python", "Pandas", "Data Visualization", "Statistical Analysis", "Excel"],
    budget: 4000,
  },
  {
    title: "Write SEO blog content for a climate startup",
    description:
      "Research and write 5 SEO-optimized blog posts on climate topics. Include keyword research, meta descriptions, and internal linking strategy.",
    skills: ["SEO", "Content Writing", "Copywriting", "WordPress", "Research"],
    budget: 2500,
  },
  {
    title: "Develop a mental health support chatbot",
    description:
      "Build a prototype chatbot for a mental health app that responds to common concerns with empathetic, vetted responses and escalates crisis keywords to human support.",
    skills: ["Python", "NLP", "LangChain", "OpenAI", "API Integration"],
    budget: 7500,
  },
  {
    title: "Automate email marketing for an e-commerce brand",
    description:
      "Set up automated email flows (welcome, cart abandonment, win-back) in a CRM, draft the copy, and define A/B tests to improve open and conversion rates.",
    skills: ["Marketing Automation", "HubSpot", "Email Marketing", "A/B Testing", "Analytics"],
    budget: 3500,
  },
];

async function main() {
  const clean = process.argv.includes("--clean");

  // 1. Ensure the seed author (recruiter) exists
  let author = await prisma.user.findUnique({ where: { email: SEED_AUTHOR_EMAIL } });
  if (!author) {
    const hashed = await bcrypt.hash(SEED_AUTHOR_PASSWORD, 10);
    author = await prisma.user.create({
      data: {
        email: SEED_AUTHOR_EMAIL,
        name: "SkillBridge Recruiter",
        password: hashed,
        role: "recruiter",
      },
    });
    console.log(`Created seed author: ${SEED_AUTHOR_EMAIL} (role: recruiter)`);
  } else {
    console.log(`Using existing seed author: ${SEED_AUTHOR_EMAIL}`);
  }

  // 2. Optional cleanup of previously seeded tasks
  if (clean) {
    const removed = await prisma.task.deleteMany({ where: { authorId: author.id } });
    console.log(`Removed ${removed.count} seeded task(s) authored by ${SEED_AUTHOR_EMAIL}`);
  }

  // 3. Seed tasks (skip any whose title already exists)
  let created = 0;
  let skipped = 0;
  for (const s of SEED_TASKS) {
    const existing = await prisma.task.findFirst({ where: { title: s.title } });
    if (existing) {
      console.log(`skip (already exists): ${s.title}`);
      skipped++;
      continue;
    }

    const embeddingText = [s.title, s.description, s.skills.join(" ")].join(" ").trim();
    const embedding = await embed(embeddingText);

    await prisma.task.create({
      data: {
        title: s.title,
        description: s.description,
        skills: s.skills.join(","),
        budget: s.budget,
        status: "open",
        embedding,
        authorId: author.id,
      },
    });
    console.log(`seeded: ${s.title}`);
    created++;
  }

  console.log(`\nDone: ${created} task(s) created, ${skipped} already present.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
