import type { NextRequest } from "next/server";
import { searchRoute } from "../_lib";

export async function GET(request: NextRequest) {
  return searchRoute(request);
}
