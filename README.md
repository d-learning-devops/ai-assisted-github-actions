# 🤖 AI-Assisted GitHub Actions — Demo Session

> A hands-on session showcasing how AI tools supercharge CI/CD workflows using **only free tools** — no credit card required.

---

## 📋 Table of Contents

- [Prerequisites & Setup](#prerequisites--setup)
- [Repository Structure](#repository-structure)
- [Demo 1 — AI Auto-Fix Failing CI](#demo-1--ai-auto-fix-failing-ci)
- [Demo 2 — AI Pull Request Code Review](#demo-2--ai-pull-request-code-review)
- [Demo 3 — AI-Generated Release Notes](#demo-3--ai-generated-release-notes)
- [Free Tools Reference](#free-tools-reference)
- [Presenter Tips](#presenter-tips)

---

## Prerequisites & Setup

Everything in this session is **100% free**. Follow these four steps before you begin.

### Step 1 — GitHub Account + Copilot Free

1. Sign up at [github.com](https://github.com) (free)
2. Go to **Settings → Copilot → Enable Copilot Free tier**
   - 2,000 completions/month
   - 50 chat messages/month
   - Coding agent + code review included
3. No credit card required

### Step 2 — VS Code + GitHub Copilot Extension

1. Download VS Code from [code.visualstudio.com](https://code.visualstudio.com) (free, all platforms)
2. Open VS Code → Extensions panel → search **GitHub Copilot** → click Install
3. Sign in with your GitHub account when prompted — activates automatically

### Step 3 — Create the Demo Repository

1. On GitHub, click **New repository**
2. Name it `ai-actions-demo`, set visibility to **Public**
3. Initialize with a README
4. Clone it locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-actions-demo.git
   cd ai-actions-demo
   ```
5. Create the workflows folder:
   ```bash
   mkdir -p .github/workflows
   ```

> **Note:** GitHub Actions is **free on all public repos** and includes 2,000 minutes/month on free private repos.

### Step 4 — Enable Copilot Coding Agent

1. Go to your repo → **Settings → Copilot**
2. Enable **coding agent**
3. Enable **Allow Copilot to create pull requests**
4. Create a context file so the agent knows your project conventions:

```bash
touch .github/copilot-instructions.md
```

Add project context inside — for example:

```markdown
# Project conventions
- Use Node.js 20
- Run `npm test` before committing
- All PRs must pass linting: `npm run lint`
- Commit message format: `type: description` (e.g. `fix: correct test command`)
```

---

## Repository Structure

After setup, your repo should look like this:

```
ai-actions-demo/
├── .github/
│   ├── copilot-instructions.md       # Copilot agent context
│   └── workflows/
│       ├── test.yml                  # Demo 1: intentionally broken test workflow
│       ├── auto-issue.yml            # Demo 1: auto-create issue on failure
│       ├── copilot-review.yml        # Demo 2: AI PR code review
│       └── release-notes.yml         # Demo 3: AI-generated changelog
├── src/
│   └── app.js                        # Sample app with intentional bugs (Demo 2)
├── test/
│   └── app.test.js                   # Tests (broken for Demo 1)
├── CHANGELOG.md                      # Auto-updated by Demo 3
└── README.md                         # This file
```

---

## Demo 1 — AI Auto-Fix Failing CI

**What it demonstrates:** A broken workflow auto-creates a GitHub Issue and assigns it to Copilot. The coding agent analyzes the failure, proposes a fix, and opens a draft PR — automatically.

### How it works

```
Push broken code → CI fails → auto-issue.yml creates an Issue
→ Issue assigned to @copilot → Copilot opens a fix PR → Review & merge
```

### Step-by-step setup

**1. Create a broken test workflow**

File: `.github/workflows/test.yml`

```yaml
name: Run Tests
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run tests   # ← intentional bug: should be `npm test`
```

**2. Create the auto-issue workflow**

File: `.github/workflows/auto-issue.yml`

```yaml
name: Auto-create Issue on CI Failure
on:
  workflow_run:
    workflows: ["Run Tests"]
    types: [completed]

jobs:
  create-issue:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    permissions:
      issues: write

    steps:
      - name: Create issue and assign to Copilot
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh issue create \
            --title "CI failure: ${{ github.event.workflow_run.name }}" \
            --body "## Workflow failed 🔴

          **Workflow:** ${{ github.event.workflow_run.name }}
          **Branch:** ${{ github.event.workflow_run.head_branch }}
          **Run URL:** ${{ github.event.workflow_run.html_url }}

          Please investigate and fix the failing workflow." \
            --assignee "@copilot" \
            --repo ${{ github.repository }}
```

**3. Create a simple test file that will fail**

File: `test/app.test.js`

```js
// Simple test — will fail because the npm script name is wrong
const assert = require('assert');

function add(a, b) { return a + b; }

assert.strictEqual(add(2, 3), 5, 'add(2, 3) should equal 5');
console.log('All tests passed!');
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "node test/app.test.js"
  }
}
```

**4. Trigger the demo**

```bash
git add .
git commit -m "feat: initial test setup"
git push origin main
```

Watch the **Actions** tab — the `Run Tests` workflow fails, `auto-issue.yml` fires, an Issue appears assigned to Copilot, and within minutes Copilot opens a draft PR with the fix.

**5. Review and merge**

1. Open the PR Copilot created
2. Review the diff (it should change `npm run tests` → `npm test`)
3. Approve and merge — the issue closes automatically

---

## Demo 2 — AI Pull Request Code Review

**What it demonstrates:** Every pull request gets an automatic Copilot code review with inline security and quality suggestions. You can then trigger Copilot to implement a fix by mentioning it in a comment.

### How it works

```
Open PR → copilot-review.yml triggers → Copilot reviews inline
→ Comment "@copilot fix the SQL injection" → Copilot opens a stacked fix PR
```

### Step-by-step setup

**1. Create the code review workflow**

File: `.github/workflows/copilot-review.yml`

```yaml
name: Copilot Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write

    steps:
      - uses: actions/checkout@v4

      - name: Request Copilot code review
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr review ${{ github.event.pull_request.number }} \
            --request-reviewer copilot[bot] \
            --repo ${{ github.repository }}
```

**2. Create a file with intentional bugs**

File: `src/app.js`

```js
const db = require('./db');

// ❌ Bug 1: SQL injection vulnerability
function getUser(userId) {
  return db.query("SELECT * FROM users WHERE id = " + userId);
}

// ❌ Bug 2: Missing null check
function getUserName(user) {
  return user.profile.name.toUpperCase();
}

// ❌ Bug 3: Unused variable
const MAX_RETRIES = 5;

function fetchData(url) {
  return fetch(url).then(res => res.json());
}

module.exports = { getUser, getUserName, fetchData };
```

**3. Trigger the demo**

```bash
git checkout -b feature/user-service
git add src/app.js
git commit -m "feat: add user service"
git push origin feature/user-service
```

Open a Pull Request from `feature/user-service` → `main`. Copilot will post inline review comments within 30–60 seconds.

**4. Trigger the auto-fix handoff**

In the PR comments, type:

```
@copilot Fix the SQL injection vulnerability in getUser() — use parameterized queries
```

Copilot will create a stacked PR implementing the fix. Review and merge.

---

## Demo 3 — AI-Generated Release Notes

**What it demonstrates:** On every push to `main`, a workflow collects recent commit messages, sends them to a free LLM (Gemini Flash), and auto-commits an updated `CHANGELOG.md` — zero manual writing.

### How it works

```
Push to main → collect last 10 commits → send to Gemini Flash (free)
→ AI writes changelog entry → auto-commit CHANGELOG.md
```

### Step-by-step setup

**1. Get a free Gemini API key**

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account (free, no credit card)
3. Click **Get API key** → **Create API key**
4. Copy the key

**2. Add the key as a GitHub secret**

1. Go to your repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `GEMINI_API_KEY`
4. Value: paste your Gemini API key
5. Click **Add secret**

**3. Create the release notes workflow**

File: `.github/workflows/release-notes.yml`

```yaml
name: AI Release Notes
on:
  push:
    branches: [main]

jobs:
  changelog:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 20

      - name: Collect recent commits
        id: commits
        run: |
          echo "LOG<<EOF" >> $GITHUB_ENV
          git log -10 --pretty=format:"- %s (%an)" >> $GITHUB_ENV
          echo "" >> $GITHUB_ENV
          echo "EOF" >> $GITHUB_ENV

      - name: Generate changelog with Gemini
        uses: appleboy/llm-action@v1
        id: ai
        with:
          provider: gemini
          model: gemini-2.0-flash
          api_key: ${{ secrets.GEMINI_API_KEY }}
          message: |
            You are a technical writer. Write a concise, friendly changelog entry
            for the following commits. Use present tense. Group related changes.
            Format as markdown with a date header and bullet points.

            Today's date: ${{ github.event.head_commit.timestamp }}
            Commits:
            ${{ env.LOG }}

      - name: Prepend to CHANGELOG.md
        run: |
          echo "${{ steps.ai.outputs.response }}" > /tmp/new_entry.md
          echo "" >> /tmp/new_entry.md
          if [ -f CHANGELOG.md ]; then
            cat CHANGELOG.md >> /tmp/new_entry.md
          fi
          mv /tmp/new_entry.md CHANGELOG.md

      - name: Commit and push changelog
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add CHANGELOG.md
          git diff --staged --quiet || git commit -m "docs: AI-generated changelog update [skip ci]"
          git push
```

> **Note:** The `[skip ci]` tag in the commit message prevents an infinite loop — the push won't re-trigger this workflow.

**4. Make some dummy commits and trigger the demo**

```bash
git commit --allow-empty -m "fix: correct button color on mobile"
git commit --allow-empty -m "feat: add dark mode toggle"
git commit --allow-empty -m "chore: update dependencies"
git push origin main
```

Watch the **Actions** tab — in about 20 seconds `CHANGELOG.md` will be committed with AI-written release notes.

---

## Free Tools Reference

| Tool | What it does | Free tier |
|------|-------------|-----------|
| [GitHub Copilot Free](https://github.com/features/copilot) | AI code completion, chat, coding agent, PR review | 2,000 completions + 50 chat/month |
| [GitHub Actions](https://github.com/features/actions) | CI/CD workflow automation | Free on public repos; 2,000 min/month private |
| [Google AI Studio — Gemini](https://aistudio.google.com) | Gemini Flash LLM API | Generous free RPM limits, no card needed |
| [appleboy/llm-action](https://github.com/appleboy/llm-action) | Open-source GitHub Action for LLM calls | Free (open source) |
| [VS Code](https://code.visualstudio.com) | Code editor | Free |

---

## Presenter Tips

| Demo | Tip |
|------|-----|
| Demo 1 | Pre-break the test file (`npm run tests`) before the session. Push live so the audience sees the issue appear and Copilot respond in real time. |
| Demo 2 | Prepare the `feature/user-service` branch with bugs beforehand. Open the PR live — Copilot usually comments within 30–60 seconds. |
| Demo 3 | Make 3–4 dummy empty commits (`git commit --allow-empty -m "..."`) before the session. Push to main live and show the auto-committed `CHANGELOG.md` appearing in ~20 seconds. |

### Suggested session timeline (45 minutes)

| Time | Section |
|------|---------|
| 0–5 min | Intro: what AI-assisted CI/CD means and why it matters |
| 5–10 min | Prerequisites walkthrough (pre-done; just show the settings) |
| 10–20 min | Demo 1 — Auto-fix CI failure live |
| 20–30 min | Demo 2 — AI PR code review live |
| 30–38 min | Demo 3 — Release notes live |
| 38–45 min | Q&A and next steps |

---

## Next Steps

- ⭐ Star this repo and share the workflow YAMLs with your team
- Enable Copilot Free on your own GitHub account at [github.com/settings/copilot](https://github.com/settings/copilot)
- Add one AI step to an existing CI job this week — start with your noisiest failure
- Explore [GitHub Agentic Workflows](https://github.blog/ai-and-ml/github-copilot/) — schedule recurring AI tasks via Actions
- Try `appleboy/llm-action` with a self-hosted Ollama model for air-gapped or private repos

---

*Built for the AI-Assisted GitHub Actions workshop. All tools used are free — no subscriptions required.*
