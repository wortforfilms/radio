import type { NextRequest } from "next/server";
import { create, list } from "../_lib";

export async function GET() {
  return list("timelineEvent", { orderBy: [{ startDate: "asc" }, { title: "asc" }], include: { location: true } });
}

export async function POST(request: NextRequest) {
  return create("timelineEvent", request);
}
