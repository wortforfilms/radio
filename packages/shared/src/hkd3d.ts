export type Hkd3dAssetStatus = "verified" | "experimental" | "draft" | "blocked";

export type Hkd3dVerificationState = "verified" | "unverified" | "blocked";

export type Hkd3dEvidenceRecord = {
  id: string;
  source: string | null;
  creator: string | null;
  tool: string | null;
  date: string | null;
  status: Hkd3dAssetStatus;
  evidence: string | null;
  verificationState: Hkd3dVerificationState;
};

export type Hkd3dAssetSlot = {
  id: string;
  stage: string;
  name: string;
  expectedPath: string;
  assetPath: string | null;
  source: string | null;
  creator: string | null;
  status: Hkd3dAssetStatus;
  evidence: Hkd3dEvidenceRecord[];
  verificationState: Hkd3dVerificationState;
  requirements: string[];
};

export type Hkd3dStage = {
  key: string;
  name: string;
  path: string;
  status: Hkd3dAssetStatus;
  description: string;
  capabilities: string[];
  slots: Hkd3dAssetSlot[];
};

export type Hkd3dCharacterSlot = {
  key: string;
  name: string;
  path: string;
  status: Hkd3dAssetStatus;
  verificationState: Hkd3dVerificationState;
  requiredScopes: string[];
};

function slot(input: Omit<Hkd3dAssetSlot, "assetPath" | "source" | "creator" | "status" | "evidence" | "verificationState">): Hkd3dAssetSlot {
  return {
    ...input,
    assetPath: null,
    source: null,
    creator: null,
    status: "blocked",
    evidence: [],
    verificationState: "blocked"
  };
}

export const hkd3dStages: Hkd3dStage[] = [
  {
    key: "base-human-model",
    name: "Base Human Model",
    path: "/hkd3d/models/base",
    status: "blocked",
    description: "Asset slots for male, female, and androgynous GLB humans. No model is marked complete until source files and topology evidence exist.",
    capabilities: ["clean topology", "quad mesh", "animation friendly", "UV unwrapped", "GLB compatible", "20k-80k polygons"],
    slots: [
      slot({
        id: "hkd3d-base-male",
        stage: "base-human-model",
        name: "male.glb",
        expectedPath: "/hkd3d/models/base/male.glb",
        requirements: ["20k-80k polygons", "quad mesh", "UV unwrapped", "rig-ready topology"]
      }),
      slot({
        id: "hkd3d-base-female",
        stage: "base-human-model",
        name: "female.glb",
        expectedPath: "/hkd3d/models/base/female.glb",
        requirements: ["20k-80k polygons", "quad mesh", "UV unwrapped", "rig-ready topology"]
      }),
      slot({
        id: "hkd3d-base-androgynous",
        stage: "base-human-model",
        name: "androgynous.glb",
        expectedPath: "/hkd3d/models/base/androgynous.glb",
        requirements: ["20k-80k polygons", "quad mesh", "UV unwrapped", "rig-ready topology"]
      })
    ]
  },
  {
    key: "texture-system",
    name: "Texture System",
    path: "/hkd3d/textures",
    status: "blocked",
    description: "PBR texture registry for skin, eyes, hair, clothing, and body materials.",
    capabilities: ["albedo", "normal", "roughness", "metallic", "ao", "subsurface", "UDIM", "KTX2", "WEBP"],
    slots: ["young", "adult", "elder"].map((layer) =>
      slot({
        id: `hkd3d-skin-${layer}`,
        stage: "texture-system",
        name: `${layer} skin layer`,
        expectedPath: `/hkd3d/textures/skin-${layer}`,
        requirements: ["PBR map set", "source texture evidence", "license/provenance", "verification swatches"]
      })
    )
  },
  {
    key: "rig-system",
    name: "Rig System",
    path: "/hkd3d/rig",
    status: "blocked",
    description: "Body and face hierarchy registry for 150-300 bone humanoid rigs.",
    capabilities: ["root", "pelvis", "spine", "chest", "neck", "head", "arms", "hands", "fingers", "legs", "feet", "toes", "eyes", "eyelids", "brows", "jaw", "lips", "tongue"],
    slots: [
      slot({
        id: "hkd3d-humanoid-rig",
        stage: "rig-system",
        name: "body-face-rig",
        expectedPath: "/hkd3d/rig/body-face-rig.hkd",
        requirements: ["150-300 bones", "retarget map", "joint orientation evidence", "deformation test evidence"]
      })
    ]
  },
  {
    key: "blendshapes",
    name: "Blendshapes",
    path: "/hkd3d/blendshapes",
    status: "blocked",
    description: "Expression and viseme morph target registry.",
    capabilities: ["neutral", "smile", "laugh", "sad", "angry", "surprised", "A", "E", "I", "O", "U", "M", "F", "L"],
    slots: [
      slot({
        id: "hkd3d-facial-morph-targets",
        stage: "blendshapes",
        name: "50-100 morph targets",
        expectedPath: "/hkd3d/blendshapes/facial-morph-targets.hkd",
        requirements: ["expression deltas", "viseme set", "neutral baseline", "facial rig compatibility"]
      })
    ]
  },
  {
    key: "animation-library",
    name: "Animation Library",
    path: "/hkd3d/animations",
    status: "blocked",
    description: "Core and Ayodhya animation clip registry with retargeting support.",
    capabilities: ["idle", "walk", "run", "sit", "stand", "jump", "namaste", "pranam", "meditation", "aarti", "blessing", "teaching", "archery", "sword", "GLTF clips", "Mixamo retargeting"],
    slots: ["idle", "walk", "run", "sit", "stand", "jump", "namaste", "pranam", "meditation", "aarti", "blessing", "teaching", "archery", "sword"].map((clip) =>
      slot({
        id: `hkd3d-animation-${clip}`,
        stage: "animation-library",
        name: clip,
        expectedPath: `/hkd3d/animations/${clip}.glb`,
        requirements: ["clip source", "retarget map", "timing evidence", "motion review evidence"]
      })
    )
  },
  {
    key: "facial-runtime",
    name: "Facial Runtime",
    path: "/hkd3d/face-runtime",
    status: "draft",
    description: "Runtime schema for eye tracking, blink, viseme, and emotion blending inputs.",
    capabilities: ["eye tracking", "blink system", "viseme mapping", "emotion blending", "audio input", "microphone input", "text input"],
    slots: [
      slot({
        id: "hkd3d-face-runtime-map",
        stage: "facial-runtime",
        name: "face-runtime-map.hkd",
        expectedPath: "/hkd3d/face-runtime/face-runtime-map.hkd",
        requirements: ["viseme mapping", "emotion weights", "input contract", "output animation contract"]
      })
    ]
  },
  {
    key: "lighting-runtime",
    name: "Lighting Runtime",
    path: "/hkd3d/lighting",
    status: "draft",
    description: "Three.js lighting mode registry for look development and scene rendering.",
    capabilities: ["HDRI", "DirectionalLight", "SpotLight", "PointLight", "Bloom", "SSAO", "SSR", "Volumetrics", "Temple", "Day", "Night", "Sunset", "Firelight", "Moonlight"],
    slots: ["Temple", "Day", "Night", "Sunset", "Firelight", "Moonlight"].map((mode) =>
      slot({
        id: `hkd3d-lighting-${mode.toLowerCase()}`,
        stage: "lighting-runtime",
        name: mode,
        expectedPath: `/hkd3d/lighting/${mode.toLowerCase()}.hkd`,
        requirements: ["lighting values", "lookdev reference", "render comparison evidence", "environment source"]
      })
    )
  },
  {
    key: "clothing-system",
    name: "Clothing System",
    path: "/hkd3d/clothing",
    status: "blocked",
    description: "Swappable clothing collections and layered materials.",
    capabilities: ["Ancient", "Royal", "Warrior", "Rishi", "Temple", "Ram", "Sita", "Lakshman", "Hanuman", "Coronation", "Forest Exile", "cloth swapping", "materials", "layers"],
    slots: ["Ancient", "Royal", "Warrior", "Rishi", "Temple", "Ram", "Sita", "Lakshman", "Hanuman", "Coronation", "Forest Exile"].map((collection) =>
      slot({
        id: `hkd3d-clothing-${collection.toLowerCase().replaceAll(" ", "-")}`,
        stage: "clothing-system",
        name: collection,
        expectedPath: `/hkd3d/clothing/${collection.toLowerCase().replaceAll(" ", "-")}`,
        requirements: ["mesh source", "material source", "layer contract", "fit evidence"]
      })
    )
  },
  {
    key: "hair-system",
    name: "Hair System",
    path: "/hkd3d/hair",
    status: "blocked",
    description: "Hair cards, groom import, and GLTF export registry.",
    capabilities: ["short", "long", "braided", "warrior", "rishi", "royal", "hair cards", "groom import", "GLTF export"],
    slots: ["short", "long", "braided", "warrior", "rishi", "royal"].map((style) =>
      slot({
        id: `hkd3d-hair-${style}`,
        stage: "hair-system",
        name: style,
        expectedPath: `/hkd3d/hair/${style}`,
        requirements: ["groom source", "card layout", "material evidence", "export evidence"]
      })
    )
  },
  {
    key: "export-runtime",
    name: "Export Runtime",
    path: "/hkd3d/export",
    status: "draft",
    description: "Format and compression pipeline contract.",
    capabilities: ["GLB", "FBX", "USD", "OBJ", "Draco", "Meshopt", "KTX2"],
    slots: [
      slot({
        id: "hkd3d-export-pipeline",
        stage: "export-runtime",
        name: "export-pipeline.hkd",
        expectedPath: "/hkd3d/export/export-pipeline.hkd",
        requirements: ["format matrix", "compression policy", "validation report", "round-trip evidence"]
      })
    ]
  }
];

export const hkd3dCharacters: Hkd3dCharacterSlot[] = ["Ram", "Sita", "Lakshman", "Hanuman", "Bharat", "Shatrughna", "Valmiki", "Vishwamitra"].map((name) => ({
  key: name.toLowerCase(),
  name,
  path: `/hkd3d/characters/${name.toLowerCase()}`,
  status: "blocked",
  verificationState: "blocked",
  requiredScopes: ["model", "textures", "rig", "animations", "metadata"]
}));

export const hkd3dAppSurfaces = [
  {
    key: "viewer",
    name: "HKD3D Viewer",
    path: "/apps/hkd3d-viewer",
    route: "/hkd3d",
    modules: ["Model", "Textures", "Rig", "Animations", "Lighting", "Export"]
  },
  {
    key: "designer",
    name: "HKD3D Designer",
    path: "/apps/hkd3d-designer",
    route: "/hkd3d#designer",
    modules: ["Model Designer", "Texture Designer", "Rig Designer", "Animation Designer", "Lighting Designer", "Clothing Designer", "Hair Designer", "Scene Designer"]
  },
  {
    key: "scene",
    name: "HKD3D Scene Composer",
    path: "/apps/hkd3d-scene",
    route: "/hkd3d#scene",
    modules: ["Human", "Environment", "Props", "Audio", "Camera", "Particles"]
  }
];

export function isHkd3dAssetProductionReady(asset: Hkd3dAssetSlot) {
  return Boolean(asset.assetPath && asset.evidence.length > 0 && asset.status === "verified" && asset.verificationState === "verified");
}

export function assertHkd3dAssetProductionReady(asset: Hkd3dAssetSlot) {
  if (!isHkd3dAssetProductionReady(asset)) {
    throw new Error("PHKD_FAIL_CLOSED: HKD3D assets require a real asset path, evidence, creator/source metadata, and verified status before production readiness.");
  }
  return asset;
}

export function getHkd3dMetrics() {
  const slots = hkd3dStages.flatMap((stage) => stage.slots);
  return {
    stageCount: hkd3dStages.length,
    assetSlotCount: slots.length,
    characterCount: hkd3dCharacters.length,
    verifiedAssetCount: slots.filter(isHkd3dAssetProductionReady).length,
    blockedAssetCount: slots.filter((slotItem) => slotItem.status === "blocked").length,
    evidenceRecordCount: slots.reduce((sum, slotItem) => sum + slotItem.evidence.length, 0)
  };
}
