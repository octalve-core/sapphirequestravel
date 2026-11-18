import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("admin login lets staff reveal and hide their password without submitting the form", () => {
  const source = read("src/features/admin/components/login-form.tsx");
  assert.match(source, /const \[passwordVisible, setPasswordVisible\] = useState\(false\)/);
  assert.match(source, /type=\{passwordVisible \? "text" : "password"\}/);
  assert.match(source, /type="button"/);
  assert.match(source, /aria-label=\{passwordVisible \? "Hide password" : "Show password"\}/);
  assert.match(source, /aria-pressed=\{passwordVisible\}/);
  assert.match(source, /aria-controls="admin-password"/);
  assert.match(source, /EyeOff/);
  assert.match(source, /Eye/);
  assert.match(source, /autoComplete="current-password"/);
  assert.match(source, /onClick=\{\(\) => setPasswordVisible\(\(value\) => !value\)\}/);
});

test("show/hide change does not modify the credentials or bypass existing login endpoint", () => {
  const source = read("src/features/admin/components/login-form.tsx");
  const route = read("src/app/api/auth/login/route.ts");
  assert.match(source, /body: JSON\.stringify\(\{ email, password \}\)/);
  assert.match(source, /fetch\("\/api\/auth\/login"/);
  assert.match(route, /compare\(result\.data\.password/);
  assert.match(route, /consumeRateLimit/);
});
