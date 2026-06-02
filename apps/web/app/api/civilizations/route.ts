import type { NextRequest } from "next/server";
import { create, list } from "../_lib";

export async function GET() {
  return list("civilization", { orderBy: { name: "asc" }, include: { children: true } });
}

export async function POST(request: NextRequest) {
  return create("civilization", request);
}
