import type { NextRequest } from "next/server";
import { create, list } from "../_lib";

export async function GET() {
  return list("text", { orderBy: { title: "asc" }, include: { language: true, subject: true, civilization: true } });
}

export async function POST(request: NextRequest) {
  return create("text", request);
}
