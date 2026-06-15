# Copilot Instructions

This is the `ai-actions-demo` repository used for demonstrating AI-assisted GitHub Actions workflows.

## Project conventions

- Runtime: Node.js 20
- Run `npm test` to execute tests (not `npm run tests`)
- All PRs must pass linting before merge
- Commit message format: `type: description`
  - Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`
  - Example: `fix: correct npm test command in workflow`

## When fixing CI failures

- Check the workflow YAML for typos in script names first
- Verify `package.json` scripts match what the workflow calls
- Do not change test logic unless the test itself is wrong

## When reviewing code

- Flag SQL injection risks — always use parameterized queries
- Flag missing null/undefined checks on object property access
- Flag unused variables and imports
