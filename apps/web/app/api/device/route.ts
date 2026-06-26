import type { NextRequest } from "next/server";
import {
  deviceRuntimeDashboardCard,
  deviceRuntimeEvidenceArtifacts,
  deviceRuntimePhkd,
  deviceRuntimeRoutes,
  deviceRuntimeTopology,
  productSurfaceMatrixEntries
} from "@shared/device-runtime";

export async function GET(request: NextRequest) {
  const view = request.nextUrl.searchParams.get("view");
  const payload = {
    id: "device-runtime",
    verificationState: "implemented-draft-device-proof-null",
    phkd: deviceRuntimePhkd,
    dashboardCard: deviceRuntimeDashboardCard,
    routes: deviceRuntimeRoutes,
    topology: deviceRuntimeTopology,
    evidenceArtifacts: deviceRuntimeEvidenceArtifacts,
    productSurfaceMatrix: productSurfaceMatrixEntries
  };

  if (view === "routes") return Response.json({ phkd: deviceRuntimePhkd, routes: deviceRuntimeRoutes });
  if (view === "runtime") return Response.json({ phkd: deviceRuntimePhkd, dashboardCard: deviceRuntimeDashboardCard, routes: deviceRuntimeRoutes });
  if (view === "topology") return Response.json({ phkd: deviceRuntimePhkd, topology: deviceRuntimeTopology });
  if (view === "evidence") return Response.json({ phkd: deviceRuntimePhkd, evidenceArtifacts: deviceRuntimeEvidenceArtifacts });
  if (view === "product-surface-matrix") return Response.json({ phkd: deviceRuntimePhkd, productSurfaceMatrix: productSurfaceMatrixEntries });
  return Response.json(payload);
}
