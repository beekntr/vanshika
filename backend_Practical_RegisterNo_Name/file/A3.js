/**
 * A3.js – Automatic test run of every endpoint in Task 1 and Task 2
 *
 * 1. Start Task 1 in one terminal:   node A1.js
 * 2. Start Task 2 in another:        node A2.js
 * 3. Run this in a third terminal:   node A3.js
 *
 * Each line shows the request, what it tests, the status code received and
 * the status code expected. Uses the built-in fetch (Node 18+), no extra packages.
 * Leaves two books in MongoDB so they can be seen in MongoDB Compass.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const LIBRARY_URL = `http://localhost:${process.env.PORT || 3000}`;
const PORTAL_URL = `http://localhost:${process.env.PORTAL_PORT || 4000}`;

// ---------- tiny helpers ----------
const paint = (code) => (s) => `\x1b[${code}m${s}\x1b[0m`;
const green = paint(32);
const red = paint(31);
const cyan = paint(36);
const dim = paint(2);
const bold = paint(1);
const yellow = paint(33);

let passed = 0;
let failed = 0;

function record(ok) {
  if (ok) passed += 1;
  else failed += 1;
  return ok ? green('✔') : red('✘');
}

function statusColor(status) {
  if (status >= 500) return red(status);
  if (status >= 400) return yellow(status);
  return green(status);
}

async function send(baseUrl, method, url, { body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(baseUrl + url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data, headers: res.headers };
}

// Sends a request and checks the status code
async function request(baseUrl, method, url, description, expected, options) {
  const res = await send(baseUrl, method, url, options);
  const mark = record(res.status === expected);
  const shownUrl = url.replace(/[a-f0-9]{24}/i, ':id');
  console.log(
    `  ${mark} ${method.padEnd(6)} ${shownUrl.padEnd(14)} ${description.padEnd(40)} ${statusColor(res.status)} ${dim(`(expected ${expected})`)}`
  );
  if (res.status !== expected) {
    console.log(red(`        response: ${JSON.stringify(res.data)}`));
  }
  return res;
}

// Checks something about a response body / header
function check(description, ok) {
  const mark = record(ok);
  console.log(`  ${mark} ${dim('CHECK ')} ${description}`);
}

async function isUp(baseUrl) {
  try {
    await fetch(baseUrl);
    return true;
  } catch {
    return false;
  }
}

function decodeJwtPayload(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
}

// ---------- Task 1 ----------
async function testTask1() {
  console.log(bold(cyan(`\nTask 1 – Library Book Management API  (${LIBRARY_URL})`)));
  if (!(await isUp(LIBRARY_URL))) {
    record(false);
    console.log(red('  ✘ Server not reachable. Start it first with:  node A1.js'));
    return;
  }

  const b1 = await request(LIBRARY_URL, 'POST', '/books', 'add book (valid)', 201, {
    body: { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', price: 1250, category: 'Computer Science' },
  });
  await request(LIBRARY_URL, 'POST', '/books', 'add book (valid)', 201, {
    body: { title: 'Database System Concepts', author: 'Abraham Silberschatz', price: 899, category: 'Databases' },
  });
  const b3 = await request(LIBRARY_URL, 'POST', '/books', 'add book (will be deleted)', 201, {
    body: { title: 'Operating System Concepts', author: 'Abraham Silberschatz', price: 975, category: 'Operating Systems' },
  });
  await request(LIBRARY_URL, 'POST', '/books', 'missing title -> invalid input', 400, {
    body: { author: 'Unknown', price: 300 },
  });
  await request(LIBRARY_URL, 'POST', '/books', 'price 0 (minimum is 1)', 400, {
    body: { title: 'Free Book', author: 'Someone', price: 0 },
  });

  const id1 = b1.data?.data?._id;
  const id3 = b3.data?.data?._id;
  if (!id1 || !id3) {
    record(false);
    console.log(red('  ✘ Could not read the new book ids – stopping Task 1 tests'));
    return;
  }
  check(`new book has isAvailable = true by default (${b1.data.data.isAvailable})`, b1.data.data.isAvailable === true);

  const all = await request(LIBRARY_URL, 'GET', '/books', 'list all books', 200);
  check(`list contains ${all.data?.count} book(s)`, Array.isArray(all.data?.data) && all.data.count >= 2);

  await request(LIBRARY_URL, 'GET', `/books/${id1}`, 'get one book', 200);

  const upd = await request(LIBRARY_URL, 'PUT', `/books/${id1}`, 'update price + availability', 200, {
    body: { price: 1100, isAvailable: false },
  });
  check(
    `updated values saved (price ${upd.data?.data?.price}, isAvailable ${upd.data?.data?.isAvailable})`,
    upd.data?.data?.price === 1100 && upd.data?.data?.isAvailable === false
  );
  await request(LIBRARY_URL, 'PUT', `/books/${id1}`, 'update with price -5 -> invalid', 400, {
    body: { price: -5 },
  });

  await request(LIBRARY_URL, 'GET', '/books/12345', 'malformed id -> invalid input', 400);
  await request(LIBRARY_URL, 'GET', '/books/64b0f0f0f0f0f0f0f0f0f0f0', 'id that does not exist', 404);
  await request(LIBRARY_URL, 'PUT', '/books/64b0f0f0f0f0f0f0f0f0f0f0', 'update a book that does not exist', 404, {
    body: { price: 500 },
  });

  await request(LIBRARY_URL, 'DELETE', `/books/${id3}`, 'delete a book', 200);
  await request(LIBRARY_URL, 'GET', `/books/${id3}`, 'get the deleted book', 404);
  await request(LIBRARY_URL, 'DELETE', `/books/${id3}`, 'delete it again', 404);
  await request(LIBRARY_URL, 'GET', '/authors', 'unknown route', 404);
}

// ---------- Task 2 ----------
async function testTask2() {
  console.log(bold(cyan(`\nTask 2 – Student Portal  (${PORTAL_URL})`)));
  if (!(await isUp(PORTAL_URL))) {
    record(false);
    console.log(red('  ✘ Server not reachable. Start it first with:  node A2.js'));
    return;
  }

  // unique emails so the script can be run again and again
  const runId = Date.now().toString().slice(-6);
  const student = { name: 'Rahul Sharma', email: `rahul.${runId}@college.edu`, password: 'student123', role: 'student' };
  const admin = { name: 'Priya Verma', email: `admin.${runId}@college.edu`, password: 'admin123', role: 'admin' };

  const reg = await request(PORTAL_URL, 'POST', '/register', 'register student', 201, { body: student });
  check('register response does not contain the password', reg.data?.data && !('password' in reg.data.data));
  await request(PORTAL_URL, 'POST', '/register', 'register admin', 201, { body: admin });
  await request(PORTAL_URL, 'POST', '/register', 'duplicate email -> rejected', 409, { body: student });
  await request(PORTAL_URL, 'POST', '/register', 'bad email format', 400, {
    body: { ...student, email: 'not-an-email' },
  });
  await request(PORTAL_URL, 'POST', '/register', 'password shorter than 6', 400, {
    body: { ...student, email: `short.${runId}@college.edu`, password: '123' },
  });
  await request(PORTAL_URL, 'POST', '/register', 'role must be student/admin', 400, {
    body: { ...student, email: `role.${runId}@college.edu`, role: 'teacher' },
  });

  await request(PORTAL_URL, 'POST', '/login', 'wrong password', 401, {
    body: { email: student.email, password: 'wrongpass' },
  });
  const sLogin = await request(PORTAL_URL, 'POST', '/login', 'login as student', 200, {
    body: { email: student.email, password: student.password },
  });
  const aLogin = await request(PORTAL_URL, 'POST', '/login', 'login as admin', 200, {
    body: { email: admin.email, password: admin.password },
  });

  const studentToken = sLogin.data?.token;
  const adminToken = aLogin.data?.token;
  if (!studentToken || !adminToken) {
    record(false);
    console.log(red('  ✘ No token returned from /login – stopping Task 2 tests'));
    return;
  }
  const payload = decodeJwtPayload(studentToken);
  check(`JWT expires in 1 hour (exp - iat = ${payload.exp - payload.iat} s)`, payload.exp - payload.iat === 3600);

  await request(PORTAL_URL, 'GET', '/profile', 'no token', 401);
  await request(PORTAL_URL, 'GET', '/profile', 'invalid token', 401, { token: 'abc.def.ghi' });
  const prof = await request(PORTAL_URL, 'GET', '/profile', 'with student token', 200, { token: studentToken });
  check(
    `profile is the logged-in user (${prof.data?.data?.email}) and has no password`,
    prof.data?.data?.email === student.email && !('password' in prof.data.data)
  );

  await request(PORTAL_URL, 'GET', '/students', 'as student -> forbidden', 403, { token: studentToken });
  await request(PORTAL_URL, 'GET', '/students', 'no token', 401);
  const list = await request(PORTAL_URL, 'GET', '/students', 'as admin', 200, { token: adminToken });
  const users = list.data?.data || [];
  check(
    `admin sees ${users.length} student(s), all role "student", no passwords`,
    users.length >= 1 && users.every((u) => u.role === 'student' && !('password' in u))
  );

  // Security middleware – look at the headers of the last response
  const h = list.headers;
  check(`helmet headers present (X-Content-Type-Options: ${h.get('x-content-type-options')})`, h.get('x-content-type-options') === 'nosniff');
  check(`cors header present (Access-Control-Allow-Origin: ${h.get('access-control-allow-origin')})`, h.get('access-control-allow-origin') === '*');
  const policy = h.get('ratelimit-policy') || h.get('ratelimit-limit');
  check(`rate limit active (RateLimit-Policy: ${policy})`, Boolean(policy) && policy.startsWith('100'));
}

// ---------- run ----------
(async () => {
  console.log(bold('Backend Practical – API test run'), dim(new Date().toLocaleString()));
  try {
    await testTask1();
    await testTask2();
  } catch (err) {
    record(false);
    console.log(red(`\nUnexpected error: ${err.message}`));
  }

  const total = passed + failed;
  const summary = `\nResult: ${passed}/${total} checks passed`;
  console.log(failed === 0 ? bold(green(summary)) : bold(red(`${summary} – ${failed} failed`)));
  process.exitCode = failed === 0 ? 0 : 1;
})();
