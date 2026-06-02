import type { NextRequest } from "next/server";
import { create, list } from "../_lib";

export async function GET() {
  return list("rishi", { orderBy: { name: "asc" } });
}

export async function POST(request: NextRequest) {
  return create("rishi", request);
}
