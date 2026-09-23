# Contributing to SkillBridge AI

Thank you for your interest in contributing to SkillBridge AI! We welcome contributions that improve code quality, performance, test coverage, and documentation.

---

## 1. Code of Conduct

Please maintain a respectful, welcoming, and inclusive environment. Avoid derogatory, harassing, or hostile behavior.

---

## 2. Getting Started

1. **Fork the Repository**:
   Fork the repository to your GitHub account and clone it locally:
   ```bash
   git clone https://github.com/<your-username>/skillBridge-AI.git
   cd skillBridge-AI
   ```

2. **Install Dependencies**:
   Install all workspace dependencies using `npm ci`:
   ```bash
   npm ci
   ```

3. **Configure Environment**:
   Copy `.env.example` to `server/.env` and update your PostgreSQL connection string:
   ```bash
   cp .env.example server/.env
   ```

4. **Prepare the Database**:
   ```bash
   npm run db:deploy -w server
   npm run db:seed -w server
   ```

---

## 3. Development Workflow

- **Branch Naming**: Use descriptive branch names:
  - `feat/feature-name`
  - `fix/bug-description`
  - `docs/documentation-update`
- **Development Servers**:
  ```bash
  npm run dev
  ```
- **Static Type Checking**:
  ```bash
  npx tsc --noEmit -p web
  ```

---

## 4. Testing Guidelines

Every pull request must maintain or improve test coverage:
```bash
# Run all tests across server and web workspaces
npm test

# Run backend unit, integration, and E2E suites
npm test -w server

# Run frontend tests
npm test -w web

# Run production readiness checks
node scripts/verify-production.mjs
```

---

## 5. Submitting a Pull Request

1. Commit your changes with clear, structured messages following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add feature`
   - `fix: resolve bug`
   - `test: add test suite`
   - `docs: update documentation`
2. Push your branch to GitHub.
3. Open a Pull Request targeting the `main` branch.
4. Verify that the GitHub Actions CI pipeline passes all tests and builds.

---

## 6. Security Vulnerabilities

Please report security vulnerabilities confidentially according to our [Security Policy](docs/SECURITY.md).
