import type { NextRequest } from "next/server";
import { create, list } from "../_lib";

export async function GET() {
  return list("subject", { orderBy: { name: "asc" }, include: { children: true } });
}

export async function POST(request: NextRequest) {
  return create("subject", request);
}
