export type DeviceRuntimeStatus = "implemented-draft" | "blocked";

export type DeviceRuntimeRoute = {
  key: string;
  title: string;
  path: string;
  api: string;
  status: DeviceRuntimeStatus;
  purpose: string;
};

export type DeviceRuntimeTopologyNode = {
  id: string;
  label: string;
  type: "runtime" | "surface" | "evidence" | "device" | "governance";
  status: DeviceRuntimeStatus;
  route: string | null;
  evidence: string | null;
};

export type DeviceRuntimeTopologyEdge = {
  from: string;
  to: string;
  relation: "observes" | "feeds" | "blocks" | "renders" | "exports";
  status: DeviceRuntimeStatus;
};

export type DeviceRuntimeTopology = {
  nodes: DeviceRuntimeTopologyNode[];
  edges: DeviceRuntimeTopologyEdge[];
};

export type DeviceRuntimeEvidenceArtifact = {
  key: string;
  title: string;
  path: string;
  status: DeviceRuntimeStatus;
  verificationState: string;
  requiredEvidence: string[];
};

export type ProductSurfaceMatrixEntry = {
  product: string;
  surface: string;
  route: string;
  api: string;
  runtime: string;
  evidence: string;
  status: DeviceRuntimeStatus;
  releaseAllowed: boolean;
};

export const deviceRuntimePhkd = {
  rule: "fail_closed",
  unknownValues: "NULL",
  productionReady: false,
  releaseAllowed: false,
  note: "Device Runtime records local capability surfaces only. Hardware proof, OS permissions, sensor readings, pairing, signing, and reviewer evidence remain NULL until imported."
};

export const deviceRuntimeRoutes: DeviceRuntimeRoute[] = [
  {
    key: "device-overview",
    title: "Device Runtime",
    path: "/device",
    api: "/api/device",
    status: "implemented-draft",
    purpose: "Operator overview for browser, desktop, sensor, permission, and evidence gates."
  },
  {
    key: "device-runtime-console",
    title: "Device Runtime Console",
    path: "/device/runtime",
    api: "/api/device?view=runtime",
    status: "implemented-draft",
    purpose: "Show local device capability lanes without claiming verified hardware telemetry."
  },
  {
    key: "device-topology",
    title: "Device Topology",
    path: "/device/topology",
    api: "/api/device?view=topology",
    status: "implemented-draft",
    purpose: "Map device nodes into dashboard, radio, desktop, and evidence surfaces."
  },
  {
    key: "device-evidence",
    title: "Device Evidence",
    path: "/device/evidence",
    api: "/api/device?view=evidence",
    status: "blocked",
    purpose: "Register required proof slots for device permissions, hardware runs, reviewers, and audit records."
  }
];

export const deviceRuntimeTopology: DeviceRuntimeTopology = {
  nodes: [
    {
      id: "sovereign-dashboard",
      label: "Sovereign Dashboard",
      type: "surface",
      status: "implemented-draft",
      route: "/dashboard",
      evidence: "/radio-html/data/product-surface-matrix.json"
    },
    {
      id: "device-runtime",
      label: "Device Runtime",
      type: "runtime",
      status: "implemented-draft",
      route: "/device",
      evidence: "/radio-html/data/device-runtime-evidence.json"
    },
    {
      id: "browser-device",
      label: "Browser Device APIs",
      type: "device",
      status: "blocked",
      route: "/device/runtime",
      evidence: "/radio-html/data/device-runtime-evidence.json"
    },
    {
      id: "desktop-device",
      label: "Desktop Device Shell",
      type: "device",
      status: "blocked",
      route: "/radio-html/surfaces/tauri-readiness.html",
      evidence: "/radio-html/data/tauri-readiness.json"
    },
    {
      id: "radio-runtime",
      label: "Radio Runtime",
      type: "runtime",
      status: "implemented-draft",
      route: "/radio/runtime",
      evidence: "/radio-html/data/radio-runtime-data.json"
    },
    {
      id: "device-evidence-registry",
      label: "Device Evidence Registry",
      type: "evidence",
      status: "blocked",
      route: "/device/evidence",
      evidence: "/radio-html/data/device-runtime-evidence.json"
    },
    {
      id: "governance-evidence-center",
      label: "Governance Evidence Center",
      type: "governance",
      status: "implemented-draft",
      route: "/governance",
      evidence: "/radio-html/data/customer-release-milestone.json"
    }
  ],
  edges: [
    { from: "sovereign-dashboard", to: "device-runtime", relation: "renders", status: "implemented-draft" },
    { from: "device-runtime", to: "browser-device", relation: "observes", status: "blocked" },
    { from: "device-runtime", to: "desktop-device", relation: "observes", status: "blocked" },
    { from: "radio-runtime", to: "device-runtime", relation: "feeds", status: "implemented-draft" },
    { from: "device-runtime", to: "device-evidence-registry", relation: "exports", status: "blocked" },
    { from: "device-evidence-registry", to: "governance-evidence-center", relation: "blocks", status: "blocked" }
  ]
};

export const deviceRuntimeEvidenceArtifacts: DeviceRuntimeEvidenceArtifact[] = [
  {
    key: "device-runtime-evidence",
    title: "Device Runtime Evidence Artifact",
    path: "/radio-html/data/device-runtime-evidence.json",
    status: "blocked",
    verificationState: "blocked-device-proof-null",
    requiredEvidence: [
      "deviceId",
      "capabilityProbe",
      "permissionGrant",
      "hardwareRun",
      "telemetryHash",
      "reviewer",
      "reviewedAt",
      "AuditLog.verified"
    ]
  },
  {
    key: "product-surface-matrix",
    title: "Product Surface Matrix",
    path: "/radio-html/data/product-surface-matrix.json",
    status: "implemented-draft",
    verificationState: "draft-product-surface-matrix",
    requiredEvidence: ["route", "api", "runtime", "evidenceArtifact"]
  }
];

export const productSurfaceMatrixEntries: ProductSurfaceMatrixEntry[] = [
  {
    product: "Radio Vaigyaaniq",
    surface: "Device Runtime",
    route: "/device",
    api: "/api/device",
    runtime: "DeviceRuntime",
    evidence: "/radio-html/data/device-runtime-evidence.json",
    status: "implemented-draft",
    releaseAllowed: false
  },
  {
    product: "Radio Vaigyaaniq",
    surface: "Device Topology",
    route: "/device/topology",
    api: "/api/device?view=topology",
    runtime: "DeviceRuntime",
    evidence: "/radio-html/data/product-surface-matrix.json",
    status: "implemented-draft",
    releaseAllowed: false
  }
];

export const deviceRuntimeDashboardCard = {
  key: "device-runtime",
  title: "Device Runtime",
  href: "/device",
  status: "implemented-draft" as const,
  summary: "Browser and desktop device capability lanes with fail-closed proof slots.",
  evidence: "/radio-html/data/device-runtime-evidence.json"
};
