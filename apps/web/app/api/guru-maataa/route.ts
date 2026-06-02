import type { NextRequest } from "next/server";
import { create, list } from "../_lib";

export async function GET() {
  return list("guruMaataa", { orderBy: { name: "asc" } });
}

export async function POST(request: NextRequest) {
  return create("guruMaataa", request);
}
