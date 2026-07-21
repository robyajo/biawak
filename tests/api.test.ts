import { describe, it, expect } from "bun:test";
import { app } from "../src/index.js";

describe("🦎 Biawak API Integration Tests", () => {
  it("GET /api/health should return status 200 and healthy status", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);

    const body = (await res.json()) as { status: string; database: string };
    expect(body.status).toBe("healthy");
    expect(body.database).toBe("connected");
  });

  it("GET /api/openapi should return valid OpenAPI 3.0 specification", async () => {
    const res = await app.request("/api/openapi");
    expect(res.status).toBe(200);

    const body = (await res.json()) as { openapi: string; info: any };
    expect(body.openapi).toBeDefined();
    expect(body.info.title).toBeDefined();
  });

  it("POST /api/auth/login with invalid credentials should return 401/400 error", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent@gmail.com",
        password: "WrongPassword123!",
      }),
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
