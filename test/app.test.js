/**
 * Simple test suite used in Demo 1 — AI Auto-Fix Failing CI.
 *
 * This test itself is correct. The intentional bug for Demo 1 lives in
 * .github/workflows/test.yml, which calls `npm run tests` (typo) instead
 * of `npm test`. That mismatch is what fails the workflow and triggers
 * the auto-issue → Copilot fix pipeline.
 */

const assert = require('assert');
const { getUser, getUserName } = require('../src/app');

function add(a, b) {
  return a + b;
}

// Basic sanity check
assert.strictEqual(add(2, 3), 5, 'add(2, 3) should equal 5');

// Exercises src/app.js so the test suite touches the demo code
const user = getUser(1)[0];
assert.ok(user, 'expected to find user with id 1');
assert.strictEqual(
  getUserName(user),
  'ADA LOVELACE',
  'getUserName should return the uppercased name'
);

console.log('All tests passed!');
