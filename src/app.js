/**
 * Sample user service used in Demo 2 — AI Pull Request Code Review.
 *
 * This file intentionally contains three bugs so that GitHub Copilot's
 * automated PR review has something meaningful to catch:
 *
 *   1. SQL injection vulnerability in getUser()
 *   2. Missing null/undefined check in getUserName()
 *   3. An unused variable (MAX_RETRIES)
 *
 * Do not "fix" these before the demo — they are the point of Demo 2.
 */

const db = require('./db');

// ❌ Bug 1: SQL injection vulnerability.
// String concatenation lets an attacker pass something like
// "1 OR 1=1" as userId and dump the entire users table.
function getUser(userId) {
  return db.query('SELECT * FROM users WHERE id = ' + userId);
}

// ❌ Bug 2: Missing null check.
// If `user` or `user.profile` is null/undefined, this throws a
// TypeError at runtime instead of failing gracefully.
function getUserName(user) {
  return user.profile.name.toUpperCase();
}

// ❌ Bug 3: Unused variable.
// Declared but never referenced anywhere — Copilot should flag this
// as dead code / a lint issue.
const MAX_RETRIES = 5;

function fetchData(url) {
  return fetch(url).then((res) => res.json());
}

module.exports = { getUser, getUserName, fetchData };
