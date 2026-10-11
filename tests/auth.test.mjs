import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

import { getAuthenticatedUserId } from "../lib/auth.ts";

const secret = "test-session-secret";
const originalSecret = process.env.AUTH_SESSION_SECRET;

function tokenFor(claims, header = { alg: "HS256", typ: "JWT" }, signingSecret = secret) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode(header)}.${encode(claims)}`;
  const signature = createHmac("sha256", signingSecret).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

function requestWithToken(token) {
  return { cookies: { get: (name) => name === "dorisbrao_session" && token ? { value: token } : undefined } };
}

function validClaims(overrides = {}) {
  return {
    sub: "user-123",
    iss: "dorisbrao",
    aud: "dorisbrao-web",
    exp: Math.floor(Date.now() / 1000) + 300,
    ...overrides,
  };
}

afterEach(() => {
  if (originalSecret === undefined) delete process.env.AUTH_SESSION_SECRET;
  else process.env.AUTH_SESSION_SECRET = originalSecret;
});

describe("getAuthenticatedUserId", () => {
  it("returns the subject from a correctly signed session", async () => {
    process.env.AUTH_SESSION_SECRET = secret;
    const token = tokenFor(validClaims({ aud: ["other-app", "dorisbrao-web"] }));
    assert.equal(await getAuthenticatedUserId(requestWithToken(token)), "user-123");
  });

  it("rejects a token with a modified signature", async () => {
    process.env.AUTH_SESSION_SECRET = secret;
    const token = tokenFor(validClaims(), undefined, "different-secret");
    assert.equal(await getAuthenticatedUserId(requestWithToken(token)), null);
  });

  it("rejects expired sessions and sessions with the wrong issuer or audience", async () => {
    process.env.AUTH_SESSION_SECRET = secret;
    for (const claims of [
      validClaims({ exp: Math.floor(Date.now() / 1000) - 1 }),
      validClaims({ iss: "untrusted-issuer" }),
      validClaims({ aud: "another-app" }),
    ]) {
      assert.equal(await getAuthenticatedUserId(requestWithToken(tokenFor(claims))), null);
    }
  });

  it("rejects missing configuration, missing cookies, and unsupported algorithms", async () => {
    delete process.env.AUTH_SESSION_SECRET;
    assert.equal(await getAuthenticatedUserId(requestWithToken(tokenFor(validClaims()))), null);

    process.env.AUTH_SESSION_SECRET = secret;
    assert.equal(await getAuthenticatedUserId(requestWithToken(undefined)), null);
    assert.equal(
      await getAuthenticatedUserId(requestWithToken(tokenFor(validClaims(), { alg: "none" }))),
      null,
    );
  });
});
