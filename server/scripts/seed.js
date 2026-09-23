// Seed script: populates the database with realistic micro-internships,
// demo recruiter, demo student, and an initial resume so matches work immediately.
//
// Usage:
//   npm run db:seed            # create demo users + tasks (skips existing titles)
//   npm run db:seed -- --clean # remove tasks and users created by the seed script first
//
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { embed } from "../src/ml/embedding.service.js";

const prisma = new PrismaClient();

const RECRUITER_EMAIL = process.env.SEED_AUTHOR_EMAIL || "recruiter@skillbridge.dev";
const STUDENT_EMAIL = "student@skillbridge.dev";
const SEED_PASSWORD = process.env.SEED_AUTHOR_PASSWORD || "password123";

const SEED_TASKS = [
  {
    title: "Full Stack Engineering Micro-Internship",
    description: "Build interactive customer-facing web features using React, TypeScript, Node.js, and PostgreSQL. Implement RESTful APIs with structured validation, responsive UI components, and automated integration tests.",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST API", "Tailwind CSS"],
    budget: 4500,
  },
  {
    title: "Generative AI & LLM Evaluation Pipeline",
    description: "Construct an automated evaluation harness for Large Language Model prompt templates using LangChain and Python. Benchmark retrieval-augmented generation (RAG) quality against standard test sets.",
    skills: ["Python", "OpenAI", "LangChain", "NLP", "PyTorch", "Docker"],
    budget: 6500,
  },
  {
    title: "Cloud Infrastructure & CI/CD Pipeline Automation",
    description: "Design automated Docker container builds and GitHub Actions CI/CD workflows. Configure monitoring, alerting, and container orchestration with Terraform on AWS cloud infrastructure.",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux"],
    budget: 5200,
  },
  {
    title: "Design System & UI/UX Product Discovery",
    description: "Create a cohesive visual identity, typography system, accessible component library in Figma, and high-fidelity interactive prototypes for a modern fintech web application.",
    skills: ["Figma", "UI/UX", "Design Systems", "Prototyping", "Accessibility"],
    budget: 3800,
  },
  {
    title: "Data Engineering & Stream Processing Micro-Internship",
    description: "Build robust ETL pipelines to clean, ingest, and aggregate high-volume telemetry data. Optimize SQL queries, write automated tests, and build automated Tableau executive dashboards.",
    skills: ["Python", "SQL", "Pandas", "PostgreSQL", "Data Pipelines", "Tableau"],
    budget: 4800,
  },
  {
    title: "Mobile App Development with React Native",
    description: "Develop cross-platform iOS and Android mobile features with React Native and Expo. Integrate push notifications, offline local state synchronization, and secure OAuth2 authentication.",
    skills: ["React Native", "TypeScript", "Mobile Development", "Expo", "Redux"],
    budget: 4200,
  },
  {
    title: "Application Security & Vulnerability Scanning Tooling",
    description: "Perform static code analysis, security auditing of npm dependencies, implement OWASP Top 10 mitigations, and automate weekly security scanning reports.",
    skills: ["Cybersecurity", "Penetration Testing", "Node.js", "Linux", "OWASP", "Python"],
    budget: 5500,
  },
  {
    title: "Real-time Donation & Payment Processing Micro-Internship",
    description: "Build a donation management dashboard for a global conservation NGO. Integrate Stripe webhooks, handle subscription retries, and display real-time donor velocity metrics.",
    skills: ["React", "Node.js", "Stripe", "PostgreSQL", "TypeScript", "Express"],
    budget: 4000,
  },
];

async function main() {
  const clean = process.argv.includes("--clean");

  console.log("Starting SkillBridge AI database seeding...");

  // 1. Ensure Recruiter exists
  let recruiter = await prisma.user.findUnique({ where: { email: RECRUITER_EMAIL } });
  if (!recruiter) {
    const hashed = await bcrypt.hash(SEED_PASSWORD, 10);
    recruiter = await prisma.user.create({
      data: {
        email: RECRUITER_EMAIL,
        name: "Acme Talent Recruiter",
        password: hashed,
        role: "recruiter",
      },
    });
    console.log(`Created demo recruiter: ${RECRUITER_EMAIL} (password: ${SEED_PASSWORD})`);
  } else {
    console.log(`Using existing demo recruiter: ${RECRUITER_EMAIL}`);
  }

  // 2. Ensure Student exists
  let student = await prisma.user.findUnique({ where: { email: STUDENT_EMAIL } });
  if (!student) {
    const hashed = await bcrypt.hash(SEED_PASSWORD, 10);
    student = await prisma.user.create({
      data: {
        email: STUDENT_EMAIL,
        name: "Alex Rivera",
        password: hashed,
        role: "student",
      },
    });
    console.log(`Created demo student: ${STUDENT_EMAIL} (password: ${SEED_PASSWORD})`);
  } else {
    console.log(`Using existing demo student: ${STUDENT_EMAIL}`);
  }

  // 3. Optional cleanup if --clean specified
  if (clean) {
    const deletedApps = await prisma.application.deleteMany({
      where: { OR: [{ userId: student.id }, { task: { authorId: recruiter.id } }] },
    });
    const deletedResumes = await prisma.resume.deleteMany({
      where: { userId: student.id },
    });
    const removedTasks = await prisma.task.deleteMany({
      where: { authorId: recruiter.id },
    });
    console.log(`Cleaned up: ${removedTasks.count} tasks, ${deletedApps.count} applications, ${deletedResumes.count} resumes.`);
  }

  // 4. Seed Tasks
  let created = 0;
  let skipped = 0;

  for (const s of SEED_TASKS) {
    const existing = await prisma.task.findFirst({ where: { title: s.title } });
    if (existing) {
      skipped++;
      continue;
    }

    const embeddingText = `${s.title} ${s.description} ${s.skills.join(" ")}`;
    let vector = null;
    try {
      vector = await embed(embeddingText);
    } catch (e) {
      console.warn(`Could not compute embedding for "${s.title}": ${e.message}`);
    }

    await prisma.task.create({
      data: {
        title: s.title,
        description: s.description,
        skills: s.skills.join(","),
        budget: s.budget,
        status: "open",
        embedding: vector,
        authorId: recruiter.id,
      },
    });
    console.log(`Seeded task: "${s.title}"`);
    created++;
  }

  // 5. Ensure Demo Student has a realistic seeded Resume
  const existingResume = await prisma.resume.findFirst({ where: { userId: student.id } });
  if (!existingResume) {
    const resumeText = `Alex Rivera
San Francisco, CA • alex@student.dev • github.com/alexrivera • linkedin.com/in/alexrivera

SUMMARY
Motivated Computer Science undergraduate with hands-on experience building full-stack web applications using React, TypeScript, Node.js, and PostgreSQL. Passionate about machine learning, API architecture, and cloud systems.

EDUCATION
B.S. in Computer Science, University of California, Berkeley (Expected May 2026)
Relevant Coursework: Data Structures & Algorithms, Database Systems, Web Development, Machine Learning, Operating Systems.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML/CSS
Frameworks & Libraries: React, Node.js, Express, Tailwind CSS, Next.js, PyTorch
Databases & Cloud: PostgreSQL, Prisma ORM, Redis, Docker, Git, REST APIs

PROJECTS & EXPERIENCE
Full Stack Web Developer Intern | OpenTech Solutions (Summer 2025)
- Designed and built responsive RESTful APIs using Node.js and Express with PostgreSQL.
- Implemented frontend features in React and TypeScript with accessible UI components.
- Automated testing workflows with Vitest achieving 90% test coverage.`;

    const resumeSkills = ["React", "TypeScript", "Node.js", "PostgreSQL", "Python", "SQL", "Express", "Docker", "Tailwind CSS", "REST API"];
    let resumeEmbedding = null;
    try {
      resumeEmbedding = await embed(resumeText);
    } catch (err) {
      console.warn(`Could not generate resume embedding: ${err.message}`);
    }

    await prisma.resume.create({
      data: {
        userId: student.id,
        filename: "alex_rivera_resume.pdf",
        mimeType: "application/pdf",
        fileSize: 48200,
        rawText: resumeText,
        skills: resumeSkills,
        parsedData: {
          skills: resumeSkills,
          education: ["B.S. in Computer Science, UC Berkeley"],
          experience: ["Full Stack Web Developer Intern at OpenTech Solutions"],
        },
        embedding: resumeEmbedding,
      },
    });
    console.log(`Created sample resume for ${student.email}`);
  }

  console.log(`\nDatabase seeding completed successfully!`);
  console.log(`- Tasks created: ${created}, skipped (already existed): ${skipped}`);
  console.log(`- Recruiter login: ${RECRUITER_EMAIL} / ${SEED_PASSWORD}`);
  console.log(`- Student login:   ${STUDENT_EMAIL} / ${SEED_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
