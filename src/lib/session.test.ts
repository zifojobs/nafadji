import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => { process.env.SESSION_SECRET = "a".repeat(64); });

describe("session token", () => {
  it("signe puis vérifie un token valide", async () => {
    const { signerToken, verifierToken } = await import("./session");
    const s = { membreId: "m1", nom: "Bangaly", isAdmin: true };
    const token = await signerToken(s);
    const relu = await verifierToken(token);
    expect(relu).toMatchObject(s);
  });

  it("rejette un token altéré", async () => {
    const { signerToken, verifierToken } = await import("./session");
    const token = await signerToken({ membreId: "m1", nom: "X", isAdmin: false });
    expect(await verifierToken(token + "x")).toBeNull();
  });
});
