// @vaigyaaniq/registry-core — stable import path for the registry platform.
// MIGRATION NOTE (Phase 5, documented assumption): the physical move of
// apps/radio/registry → packages/registry is deferred — it would break the
// additive-changes rule and frozen import verification cannot run offline.
// Consumers import from here; when the physical move happens, only this file changes.
export * from "../../../apps/radio/registry/index.ts";
