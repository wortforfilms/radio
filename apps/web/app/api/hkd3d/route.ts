import { getHkd3dMetrics, hkd3dAppSurfaces, hkd3dCharacters, hkd3dStages } from "@shared/hkd3d";

export async function GET() {
  return Response.json({
    runtime: "HKD3D Human Runtime",
    phkd: {
      policy: "fail_closed",
      productionReady: false,
      note: "No HKD3D model, texture, rig, blendshape, animation, scan, or render quality is claimed without verified evidence."
    },
    metrics: getHkd3dMetrics(),
    stages: hkd3dStages,
    characters: hkd3dCharacters,
    apps: hkd3dAppSurfaces
  });
}
