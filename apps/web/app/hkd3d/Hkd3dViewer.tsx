"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Hkd3dStage } from "@shared/hkd3d";

type Props = {
  stages: Hkd3dStage[];
};

const lightingModes = {
  Temple: { background: 0x1c1208, key: 0xffc46b, fill: 0x5f8f7a },
  Day: { background: 0xdde9f2, key: 0xffffff, fill: 0xa9c8ff },
  Night: { background: 0x080b18, key: 0x9db7ff, fill: 0x30436f },
  Sunset: { background: 0x28131b, key: 0xff8b45, fill: 0x5e6aa0 },
  Firelight: { background: 0x190b05, key: 0xff6b2c, fill: 0x41210d },
  Moonlight: { background: 0x09111e, key: 0xb8d5ff, fill: 0x344a73 }
};

type LightingMode = keyof typeof lightingModes;

export default function Hkd3dViewer({ stages }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<LightingMode>("Temple");
  const [selectedStage, setSelectedStage] = useState(stages[0]?.key ?? "base-human-model");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(lightingModes[mode].background);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.6, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const root = new THREE.Group();
    scene.add(root);

    const material = new THREE.MeshStandardMaterial({
      color: 0xd8c4a7,
      metalness: 0.05,
      roughness: 0.72,
      wireframe: true
    });
    const blockedMaterial = new THREE.MeshStandardMaterial({
      color: 0x385c54,
      metalness: 0.08,
      roughness: 0.86
    });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1.4, 8, 16), material);
    torso.position.y = 1.45;
    root.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 16), material);
    head.position.y = 2.72;
    root.add(head);

    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.36, 0.62), blockedMaterial);
    pelvis.position.y = 0.78;
    root.add(pelvis);

    const limbGeometry = new THREE.CapsuleGeometry(0.12, 1.1, 8, 12);
    [
      [-0.78, 1.55, 0.2, -0.28],
      [0.78, 1.55, 0.2, 0.28],
      [-0.34, 0.0, 0.05, 0.08],
      [0.34, 0.0, 0.05, -0.08]
    ].forEach(([x, y, z, rotation]) => {
      const limb = new THREE.Mesh(limbGeometry, material);
      limb.position.set(x, y, z);
      limb.rotation.z = rotation;
      root.add(limb);
    });

    const grid = new THREE.GridHelper(5, 10, 0xc9a35d, 0x31423a);
    grid.position.y = -0.7;
    scene.add(grid);

    const keyLight = new THREE.DirectionalLight(lightingModes[mode].key, 2.2);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(lightingModes[mode].fill, 1.4, 8);
    fillLight.position.set(-2, 1.6, 3);
    scene.add(fillLight);
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    const resize = () => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth ?? 800;
      const height = Math.max(parent?.clientHeight ?? 520, 420);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      root.rotation.y += 0.006;
      renderer.render(scene, camera);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      material.dispose();
      blockedMaterial.dispose();
    };
  }, [mode]);

  const stage = stages.find((item) => item.key === selectedStage) ?? stages[0];

  return (
    <section className="hkd3d-runtime-grid" aria-label="HKD3D Three.js runtime">
      <div className="hkd3d-canvas-panel">
        <canvas ref={canvasRef} aria-label="HKD3D diagnostic Three.js viewer" />
        <div className="hkd3d-viewer-note">
          <span>Diagnostic Scene</span>
          <strong>No completed human asset loaded</strong>
        </div>
      </div>
      <aside className="hkd3d-control-panel">
        <label>
          <span>Lighting Mode</span>
          <select value={mode} onChange={(event) => setMode(event.target.value as LightingMode)}>
            {Object.keys(lightingModes).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Runtime Scope</span>
          <select value={selectedStage} onChange={(event) => setSelectedStage(event.target.value)}>
            {stages.map((item) => (
              <option key={item.key} value={item.key}>{item.name}</option>
            ))}
          </select>
        </label>
        <div className="hkd3d-selected-stage">
          <span>{stage.status}</span>
          <h3>{stage.name}</h3>
          <p>{stage.description}</p>
          <div>
            {stage.capabilities.map((capability) => (
              <small key={capability}>{capability}</small>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}
