import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { errorResponse } from "@/lib/api-errors";

const prismaError = (code: string, target?: string[]) =>
  new Prisma.PrismaClientKnownRequestError("db error", {
    code,
    clientVersion: "6.19.3",
    meta: target ? { target } : undefined,
  });

describe("errorResponse", () => {
  it("returns 409 for a duplicate slug", async () => {
    const res = errorResponse(prismaError("P2002", ["slug"]), "Failed to create product");
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Duplicate slug. Change the name or slug and try again." });
  });

  it("returns 400 for a missing linked record", async () => {
    const res = errorResponse(prismaError("P2003"), "Failed to create product");
    expect(res.status).toBe(400);
  });

  it("returns 404 when the record is gone", async () => {
    const res = errorResponse(prismaError("P2025"), "Failed to update product");
    expect(res.status).toBe(404);
  });

  it("returns 400 for a malformed JSON body", async () => {
    const res = errorResponse(new SyntaxError("Unexpected token"), "Failed to create product");
    expect(res.status).toBe(400);
  });

  it("keeps 500 with the fallback message for anything else", async () => {
    const res = errorResponse(new Error("boom"), "Failed to create product");
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to create product" });
  });
});
