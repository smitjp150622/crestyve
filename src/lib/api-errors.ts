import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * Turns a thrown error into a useful HTTP response.
 * - Unique constraint clash (e.g. a duplicate product slug) -> 409
 * - Missing related record (e.g. unknown categoryId) -> 400
 * - Record not found -> 404
 * - Malformed JSON body -> 400
 * - Anything else -> 500 with the given fallback message
 */
export function errorResponse(error: unknown, fallback: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const fields = (error.meta?.target as string[] | undefined)?.join(", ") ?? "value";
      return NextResponse.json(
        { error: `Duplicate ${fields}. Change the name or slug and try again.` },
        { status: 409 }
      );
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "A linked record does not exist. Check the category or related item." },
        { status: 400 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }
  return NextResponse.json({ error: fallback }, { status: 500 });
}
