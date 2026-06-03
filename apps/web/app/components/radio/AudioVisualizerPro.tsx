"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    THREE?: any;
    webkitAudioContext?: typeof AudioContext;
  }
}

type SceneName = "sphere" | "bars" | "particles" | "waveform" | "terrain" | "rings" | "mandala" | "gravity" | "cloth" | "vortex" | "shockwave";

const sceneLabels: Record<SceneName, string> = {
  sphere: "Sphere",
  bars: "32 Bars",
  particles: "500 Particles",
  waveform: "Wave Tunnel",
  terrain: "Terrain Grid",
  rings: "Nebula Rings",
  mandala: "Mandala Field",
  gravity: "Gravity Physics",
  cloth: "Spring Cloth",
  vortex: "Vortex Flow",
  shockwave: "Shockwave Cinema"
};

function loadThreeGlobal(): Promise<any> {
  if (window.THREE) return Promise.resolve(window.THREE);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-radio-three]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.THREE));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "/radio-html/assets/vendor/three.min.js";
    script.dataset.radioThree = "true";
    script.onload = () => resolve(window.THREE);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function AudioVisualizerPro() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioGraphRef = useRef<{
    context: AudioContext | null;
    analyser: AnalyserNode | null;
    data: Uint8Array<ArrayBuffer>;
    sourceNode: AudioNode | null;
    fileSourceNode: MediaElementAudioSourceNode | null;
    micStream: MediaStream | null;
  }>({ context: null, analyser: null, data: new Uint8Array(new ArrayBuffer(1024)), sourceNode: null, fileSourceNode: null, micStream: null });
  const [sceneName, setSceneName] = useState<SceneName>("sphere");
  const sceneNameRef = useRef<SceneName>("sphere");
  const [status, setStatus] = useState("WEB AUDIO IDLE · MICROPHONE REQUIRES BROWSER PERMISSION · EXPORT NULL");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    sceneNameRef.current = sceneName;
    setStatus(`SCENE ACTIVE · ${sceneName.toUpperCase()} · WEB AUDIO ANALYSER LOCAL`);
  }, [sceneName]);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    loadThreeGlobal().then((THREE) => {
      if (cancelled || !THREE || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
      camera.position.set(0, 3.2, 18);
      let renderer: any;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
      } catch (error) {
        setStatus("WEBGL UNAVAILABLE · THREE.JS VISUALIZER FAIL-CLOSED");
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x05080c, 1);
      scene.add(new THREE.AmbientLight(0xffffff, 0.72));
      const key = new THREE.PointLight(0x00f5d4, 1.4, 80);
      key.position.set(8, 10, 10);
      scene.add(key);
      const rim = new THREE.PointLight(0xff6b35, 1.1, 80);
      rim.position.set(-10, -4, 12);
      scene.add(rim);

      const sphereGeometry = new THREE.SphereGeometry(4.2, 64, 32);
      const sphereBase = Float32Array.from(sphereGeometry.attributes.position.array);
      const sphere = new THREE.Mesh(sphereGeometry, new THREE.MeshStandardMaterial({
        color: 0x00f5d4,
        emissive: 0x003833,
        metalness: 0.15,
        roughness: 0.28,
        wireframe: true
      }));
      scene.add(sphere);

      const barsGroup = new THREE.Group();
      const bars: any[] = [];
      for (let i = 0; i < 32; i += 1) {
        const hue = i / 32;
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(hue, 0.92, 0.56),
          emissive: new THREE.Color().setHSL(hue, 0.8, 0.18),
          roughness: 0.34,
          metalness: 0.08
        });
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1, 0.34), material);
        const angle = i * Math.PI * 2 / 32;
        bar.position.set(Math.cos(angle) * 6.2, 0, Math.sin(angle) * 6.2);
        bar.rotation.y = -angle;
        barsGroup.add(bar);
        bars.push(bar);
      }
      scene.add(barsGroup);

      const particleCount = 500;
      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleBase = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i += 1) {
        const radius = 3 + Math.random() * 9;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions.set([x, y, z], i * 3);
        particleBase.set([x, y, z], i * 3);
        const color = new THREE.Color().setHSL((i / particleCount + 0.55) % 1, 0.95, 0.62);
        particleColors.set([color.r, color.g, color.b], i * 3);
      }
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
      particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
      const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      scene.add(particles);

      const waveformGroup = new THREE.Group();
      const waveformLines: any[] = [];
      for (let layer = 0; layer < 18; layer += 1) {
        const points = [];
        for (let i = 0; i < 128; i += 1) {
          points.push(new THREE.Vector3(-9 + i * 18 / 127, 0, -layer * 0.85));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHSL(0.48 + layer * 0.018, 0.95, 0.58),
          transparent: true,
          opacity: 0.72
        });
        const line = new THREE.Line(geometry, material);
        waveformGroup.add(line);
        waveformLines.push(line);
      }
      waveformGroup.position.z = 5;
      scene.add(waveformGroup);

      const terrainSize = 34;
      const terrainGeometry = new THREE.PlaneGeometry(15, 15, terrainSize - 1, terrainSize - 1);
      const terrainBase = Float32Array.from(terrainGeometry.attributes.position.array);
      const terrain = new THREE.Mesh(terrainGeometry, new THREE.MeshStandardMaterial({
        color: 0x10202b,
        emissive: 0x06262f,
        metalness: 0.18,
        roughness: 0.22,
        wireframe: true
      }));
      terrain.rotation.x = -Math.PI / 2.6;
      terrain.position.y = -3.7;
      terrain.position.z = -1.5;
      scene.add(terrain);

      const ringsGroup = new THREE.Group();
      const rings: any[] = [];
      for (let i = 0; i < 48; i += 1) {
        const radius = 1.1 + i * 0.16;
        const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2);
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(160).map((point: { x: number; y: number }) => new THREE.Vector3(point.x, point.y, Math.sin(i) * 0.08)));
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHSL((i / 48 + 0.06) % 1, 0.95, 0.58),
          transparent: true,
          opacity: 0.12 + i / 130
        });
        const ring = new THREE.LineLoop(geometry, material);
        ring.rotation.x = Math.PI / 2.8 + i * 0.011;
        ringsGroup.add(ring);
        rings.push(ring);
      }
      scene.add(ringsGroup);

      const mandalaGroup = new THREE.Group();
      const mandalaRays: any[] = [];
      for (let i = 0; i < 96; i += 1) {
        const angle = i * Math.PI * 2 / 96;
        const inner = new THREE.Vector3(Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, 0);
        const outer = new THREE.Vector3(Math.cos(angle) * 6.8, Math.sin(angle) * 6.8, 0);
        const geometry = new THREE.BufferGeometry().setFromPoints([inner, outer]);
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHSL((i / 96 + 0.78) % 1, 0.92, 0.62),
          transparent: true,
          opacity: 0.5
        });
        const ray = new THREE.Line(geometry, material);
        mandalaGroup.add(ray);
        mandalaRays.push(ray);
      }
      scene.add(mandalaGroup);

      const gravityCount = 84;
      const gravityGroup = new THREE.Group();
      const gravityMesh = new THREE.InstancedMesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffcf70, emissive: 0x2a1600, metalness: 0.2, roughness: 0.36 }),
        gravityCount
      );
      const gravityPositions = new Float32Array(gravityCount * 3);
      const gravityVelocities = new Float32Array(gravityCount * 3);
      const gravityDummy = new THREE.Object3D();
      for (let i = 0; i < gravityCount; i += 1) {
        const radius = 1.5 + Math.random() * 7.5;
        const angle = Math.random() * Math.PI * 2;
        gravityPositions.set([Math.cos(angle) * radius, (Math.random() - 0.5) * 5, Math.sin(angle) * radius], i * 3);
        gravityVelocities.set([-Math.sin(angle) * 0.018, (Math.random() - 0.5) * 0.012, Math.cos(angle) * 0.018], i * 3);
      }
      gravityGroup.add(gravityMesh);
      const gravityCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.46, 32, 16),
        new THREE.MeshStandardMaterial({ color: 0xff6b35, emissive: 0x4a1204, metalness: 0.35, roughness: 0.24 })
      );
      gravityGroup.add(gravityCore);
      scene.add(gravityGroup);

      const clothSegmentsX = 28;
      const clothSegmentsY = 16;
      const clothGeometry = new THREE.PlaneGeometry(16, 9, clothSegmentsX - 1, clothSegmentsY - 1);
      const clothBase = Float32Array.from(clothGeometry.attributes.position.array);
      const clothVelocity = new Float32Array(clothGeometry.attributes.position.count * 3);
      const cloth = new THREE.Mesh(clothGeometry, new THREE.MeshStandardMaterial({
        color: 0x00f5d4,
        emissive: 0x05252a,
        roughness: 0.22,
        metalness: 0.1,
        wireframe: true
      }));
      cloth.position.y = -0.8;
      cloth.rotation.x = -0.68;
      scene.add(cloth);

      const vortexCount = 720;
      const vortexGeometry = new THREE.BufferGeometry();
      const vortexPositions = new Float32Array(vortexCount * 3);
      const vortexVelocities = new Float32Array(vortexCount * 3);
      const vortexColors = new Float32Array(vortexCount * 3);
      for (let i = 0; i < vortexCount; i += 1) {
        const radius = 0.6 + Math.random() * 8.5;
        const angle = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 8;
        vortexPositions.set([Math.cos(angle) * radius, y, Math.sin(angle) * radius], i * 3);
        vortexVelocities.set([-Math.sin(angle) * 0.015, 0.015 + Math.random() * 0.025, Math.cos(angle) * 0.015], i * 3);
        const color = new THREE.Color().setHSL((i / vortexCount + 0.44) % 1, 0.96, 0.6);
        vortexColors.set([color.r, color.g, color.b], i * 3);
      }
      vortexGeometry.setAttribute("position", new THREE.BufferAttribute(vortexPositions, 3));
      vortexGeometry.setAttribute("color", new THREE.BufferAttribute(vortexColors, 3));
      const vortex = new THREE.Points(vortexGeometry, new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.86,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      scene.add(vortex);

      const shockwaveGroup = new THREE.Group();
      const shockwaves: any[] = [];
      for (let i = 0; i < 18; i += 1) {
        const curve = new THREE.EllipseCurve(0, 0, 0.8 + i * 0.5, 0.8 + i * 0.5, 0, Math.PI * 2);
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(180).map((point: { x: number; y: number }) => new THREE.Vector3(point.x, point.y, 0)));
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHSL((i / 18 + 0.04) % 1, 0.95, 0.58),
          transparent: true,
          opacity: 0.68
        });
        const wave = new THREE.LineLoop(geometry, material);
        wave.rotation.x = Math.PI / 2.8;
        wave.userData.phase = i / 18;
        shockwaveGroup.add(wave);
        shockwaves.push(wave);
      }
      scene.add(shockwaveGroup);

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height, false);
        camera.aspect = rect.width / Math.max(1, rect.height);
        camera.updateProjectionMatrix();
      };
      const averageVolume = () => {
        const graph = audioGraphRef.current;
        if (!graph.analyser) return 0.08;
        graph.analyser.getByteFrequencyData(graph.data);
        return graph.data.reduce((sum, value) => sum + value, 0) / (graph.data.length * 255);
      };
      const animate = (timeMs: number) => {
        if (cancelled) return;
        const graph = audioGraphRef.current;
        const data = graph.data;
        const time = timeMs * 0.001;
        const volume = averageVolume();
        sphere.visible = sceneNameRef.current === "sphere";
        barsGroup.visible = sceneNameRef.current === "bars";
        particles.visible = sceneNameRef.current === "particles";
        waveformGroup.visible = sceneNameRef.current === "waveform";
        terrain.visible = sceneNameRef.current === "terrain";
        ringsGroup.visible = sceneNameRef.current === "rings";
        mandalaGroup.visible = sceneNameRef.current === "mandala";
        gravityGroup.visible = sceneNameRef.current === "gravity";
        cloth.visible = sceneNameRef.current === "cloth";
        vortex.visible = sceneNameRef.current === "vortex";
        shockwaveGroup.visible = sceneNameRef.current === "shockwave";
        const position = sphereGeometry.attributes.position;
        for (let i = 0; i < position.count; i += 1) {
          const band = data[i % data.length] / 255;
          const scale = 1 + volume * 0.9 + band * 0.22 + Math.sin(time * 1.8 + i * 0.035) * 0.025;
          position.setXYZ(i, sphereBase[i * 3] * scale, sphereBase[i * 3 + 1] * scale, sphereBase[i * 3 + 2] * scale);
        }
        position.needsUpdate = true;
        sphere.rotation.y = time * 0.24;
        sphere.rotation.x = Math.sin(time * 0.4) * 0.18;
        bars.forEach((bar, index) => {
          const value = data[Math.floor(index * data.length / 32)] / 255;
          const height = 0.2 + value * 9.5;
          bar.scale.y = height;
          bar.position.y = height * 0.5 - 2.2;
        });
        barsGroup.rotation.y = time * 0.18;
        const positions = particleGeometry.attributes.position.array;
        for (let i = 0; i < particleCount; i += 1) {
          const band = data[i % data.length] / 255;
          const pulse = 1 + volume * 1.5 + band * 0.7 + Math.sin(time * 2 + i) * 0.04;
          positions[i * 3] = particleBase[i * 3] * pulse;
          positions[i * 3 + 1] = particleBase[i * 3 + 1] * pulse;
          positions[i * 3 + 2] = particleBase[i * 3 + 2] * pulse;
        }
        particleGeometry.attributes.position.needsUpdate = true;
        particles.rotation.y = time * 0.09;
        particles.rotation.x = Math.sin(time * 0.18) * 0.2;
        waveformLines.forEach((line, layer) => {
          const attr = line.geometry.attributes.position;
          for (let i = 0; i < attr.count; i += 1) {
            const band = data[(i * 4 + layer * 13) % data.length] / 255;
            attr.setY(i, Math.sin(i * 0.22 + time * 3 + layer * 0.42) * (0.18 + band * 1.5));
          }
          attr.needsUpdate = true;
          line.position.z = 4 - ((layer * 0.85 + time * 2.2) % 15);
        });
        const terrainPosition = terrainGeometry.attributes.position;
        for (let i = 0; i < terrainPosition.count; i += 1) {
          const x = terrainBase[i * 3];
          const y = terrainBase[i * 3 + 1];
          const z = terrainBase[i * 3 + 2];
          const band = data[(i * 7) % data.length] / 255;
          terrainPosition.setXYZ(i, x, y, z + Math.sin(time * 1.4 + x * 0.8 + y * 0.55) * 0.45 + band * 2.4);
        }
        terrainPosition.needsUpdate = true;
        terrain.rotation.z = Math.sin(time * 0.1) * 0.08;
        rings.forEach((ring, index) => {
          const band = data[(index * 11) % data.length] / 255;
          const scale = 1 + band * 0.34 + volume * 0.22;
          ring.scale.setScalar(scale);
          ring.rotation.z = time * (0.04 + index * 0.0009);
        });
        ringsGroup.rotation.y = Math.sin(time * 0.24) * 0.42;
        mandalaRays.forEach((ray, index) => {
          const band = data[(index * 5) % data.length] / 255;
          ray.scale.y = 0.7 + band * 1.35 + volume * 0.8;
          ray.rotation.z = Math.sin(time * 1.2 + index * 0.05) * 0.035;
        });
        mandalaGroup.rotation.z = time * 0.12;
        mandalaGroup.rotation.x = Math.sin(time * 0.35) * 0.18;
        for (let i = 0; i < gravityCount; i += 1) {
          const offset = i * 3;
          const x = gravityPositions[offset];
          const y = gravityPositions[offset + 1];
          const z = gravityPositions[offset + 2];
          const distSq = Math.max(0.35, x * x + y * y + z * z);
          const force = (0.012 + volume * 0.06 + (data[(i * 9) % data.length] / 255) * 0.018) / distSq;
          gravityVelocities[offset] += -x * force;
          gravityVelocities[offset + 1] += -y * force * 0.42 + Math.sin(time + i) * 0.0008;
          gravityVelocities[offset + 2] += -z * force;
          gravityVelocities[offset] += -z * 0.0009;
          gravityVelocities[offset + 2] += x * 0.0009;
          gravityVelocities[offset] *= 0.996;
          gravityVelocities[offset + 1] *= 0.994;
          gravityVelocities[offset + 2] *= 0.996;
          gravityPositions[offset] += gravityVelocities[offset];
          gravityPositions[offset + 1] += gravityVelocities[offset + 1];
          gravityPositions[offset + 2] += gravityVelocities[offset + 2];
          gravityDummy.position.set(gravityPositions[offset], gravityPositions[offset + 1], gravityPositions[offset + 2]);
          gravityDummy.scale.setScalar(0.65 + (data[(i * 5) % data.length] / 255) * 1.8);
          gravityDummy.updateMatrix();
          gravityMesh.setMatrixAt(i, gravityDummy.matrix);
        }
        gravityMesh.instanceMatrix.needsUpdate = true;
        gravityCore.scale.setScalar(1 + volume * 1.3);
        gravityGroup.rotation.y = time * 0.12;
        const clothPosition = clothGeometry.attributes.position;
        for (let i = 0; i < clothPosition.count; i += 1) {
          const offset = i * 3;
          const baseX = clothBase[offset];
          const baseY = clothBase[offset + 1];
          const baseZ = clothBase[offset + 2];
          const col = i % clothSegmentsX;
          const row = Math.floor(i / clothSegmentsX);
          const pinned = row === clothSegmentsY - 1 && (col % 4 === 0 || col === clothSegmentsX - 1);
          const band = data[(col * 17 + row * 29) % data.length] / 255;
          const targetZ = baseZ + Math.sin(time * 1.8 + col * 0.36 + row * 0.2) * 0.35 + band * 1.9 + volume * 0.7;
          const currentZ = clothPosition.getZ(i);
          clothVelocity[offset + 2] += (targetZ - currentZ) * (pinned ? 0.18 : 0.045);
          clothVelocity[offset + 2] *= pinned ? 0.68 : 0.9;
          clothPosition.setXYZ(i, baseX, baseY + Math.sin(time + col * 0.2) * 0.04, currentZ + clothVelocity[offset + 2]);
        }
        clothPosition.needsUpdate = true;
        cloth.rotation.z = Math.sin(time * 0.18) * 0.12;
        const vortexAttr = vortexGeometry.attributes.position;
        for (let i = 0; i < vortexCount; i += 1) {
          const offset = i * 3;
          let x = vortexPositions[offset];
          let y = vortexPositions[offset + 1];
          let z = vortexPositions[offset + 2];
          const radius = Math.max(0.4, Math.sqrt(x * x + z * z));
          const band = data[(i * 3) % data.length] / 255;
          const swirl = 0.024 + band * 0.07 + volume * 0.05;
          vortexVelocities[offset] += (-z / radius) * swirl - x * 0.0014;
          vortexVelocities[offset + 1] += 0.002 + band * 0.004;
          vortexVelocities[offset + 2] += (x / radius) * swirl - z * 0.0014;
          vortexVelocities[offset] *= 0.84;
          vortexVelocities[offset + 1] *= 0.88;
          vortexVelocities[offset + 2] *= 0.84;
          x += vortexVelocities[offset];
          y += vortexVelocities[offset + 1];
          z += vortexVelocities[offset + 2];
          if (y > 7 || radius > 11) {
            const angle = Math.random() * Math.PI * 2;
            const resetRadius = 0.8 + Math.random() * 2.8;
            x = Math.cos(angle) * resetRadius;
            y = -6;
            z = Math.sin(angle) * resetRadius;
          }
          vortexPositions.set([x, y, z], offset);
          vortexAttr.setXYZ(i, x, y, z);
        }
        vortexAttr.needsUpdate = true;
        vortex.rotation.y = time * 0.08;
        shockwaves.forEach((wave) => {
          const phase = (wave.userData.phase + time * (0.1 + volume * 0.35)) % 1;
          const scale = 0.4 + phase * (7 + volume * 5);
          wave.scale.setScalar(scale);
          wave.material.opacity = Math.max(0, 0.75 - phase * 0.75);
          wave.rotation.z = time * 0.08 + phase * Math.PI;
        });
        shockwaveGroup.rotation.y = Math.sin(time * 0.18) * 0.35;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      window.addEventListener("resize", resize);
      resize();
      requestAnimationFrame(animate);
      cleanup = () => {
        window.removeEventListener("resize", resize);
        renderer.dispose();
      };
      setStatus("SCENE ACTIVE · SPHERE · WEB AUDIO ANALYSER LOCAL");
    }).catch(() => setStatus("THREE.JS LOAD FAILED · VISUALIZER BLOCKED"));
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  const ensureAudioGraph = () => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      setStatus("WEB AUDIO API UNAVAILABLE · ANALYSER BLOCKED");
      return false;
    }
    const graph = audioGraphRef.current;
    if (!graph.context) {
      graph.context = new AudioContextCtor();
      graph.analyser = graph.context.createAnalyser();
      graph.analyser.fftSize = 1024;
      graph.data = new Uint8Array(new ArrayBuffer(graph.analyser.frequencyBinCount));
    }
    return true;
  };

  const disconnectSource = () => {
    const graph = audioGraphRef.current;
    if (graph.sourceNode) {
      try { graph.sourceNode.disconnect(); } catch {}
      if (graph.sourceNode !== graph.fileSourceNode) graph.sourceNode = null;
    }
    if (graph.micStream) {
      graph.micStream.getTracks().forEach((track) => track.stop());
      graph.micStream = null;
    }
  };

  const useMicInput = async () => {
    if (!ensureAudioGraph()) return;
    const graph = audioGraphRef.current;
    try {
      await graph.context?.resume();
      disconnectSource();
      graph.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      graph.sourceNode = graph.context!.createMediaStreamSource(graph.micStream);
      graph.sourceNode.connect(graph.analyser!);
      setStatus("MIC INPUT ACTIVE · USER-GRANTED BROWSER STREAM · SERVER AUDIO EVIDENCE NULL");
    } catch {
      setStatus("MIC INPUT BLOCKED · PERMISSION OR DEVICE UNAVAILABLE");
    }
  };

  const useAudioFile = async (file?: File) => {
    if (!file || !audioRef.current || !ensureAudioGraph()) return;
    const graph = audioGraphRef.current;
    await graph.context?.resume();
    disconnectSource();
    audioRef.current.src = URL.createObjectURL(file);
    audioRef.current.load();
    if (!graph.fileSourceNode) graph.fileSourceNode = graph.context!.createMediaElementSource(audioRef.current);
    graph.sourceNode = graph.fileSourceNode;
    graph.sourceNode.connect(graph.analyser!);
    graph.analyser!.connect(graph.context!.destination);
    audioRef.current.play().catch(() => {});
    setStatus(`FILE INPUT ACTIVE · ${file.name} · LOCAL OBJECT URL · SERVER AUDIO EVIDENCE NULL`);
  };

  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas?.captureStream || typeof MediaRecorder === "undefined") {
      setStatus("VIDEO EXPORT BLOCKED · MEDIARECORDER OR CAPTURESTREAM UNAVAILABLE");
      return;
    }
    chunksRef.current = [];
    const stream = canvas.captureStream(30);
    recorderRef.current = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm" });
    recorderRef.current.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
    recorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setDownloadUrl(URL.createObjectURL(blob));
      setStatus(`VIDEO EXPORT READY · ${(blob.size / 1024 / 1024).toFixed(2)} MB WEBM · LOCAL BROWSER CAPTURE`);
    };
    recorderRef.current.start();
    setStatus("RECORDING VISUALIZER · CANVAS STREAM 30 FPS · AUDIO TRACK NULL");
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
  };

  return (
    <section className="radio-pro-visualizer" id="audioVisualizerPro">
      <div>
        <h2>3D Audio Visualizer Pro</h2>
        <p>{status}</p>
      </div>
      <canvas ref={canvasRef} aria-label="Three.js audio visualizer canvas" />
      <div className="radio-viz-controls" aria-label="3D audio visualizer controls">
        {(["sphere", "bars", "particles", "waveform", "terrain", "rings", "mandala", "gravity", "cloth", "vortex", "shockwave"] as SceneName[]).map((name) => (
          <button className={sceneName === name ? "active" : ""} data-viz-scene={name} key={name} onClick={() => setSceneName(name)}>
            {sceneLabels[name]}
          </button>
        ))}
        <button onClick={useMicInput}>Mic Input</button>
        <label>
          Upload Audio
          <input accept="audio/*" type="file" onChange={(event) => useAudioFile(event.target.files?.[0])} />
        </label>
        <button onClick={startRecording}>Record</button>
        <button onClick={stopRecording}>Stop</button>
        {downloadUrl ? <a download="radio-vaigyaaniq-visualizer.webm" href={downloadUrl}>Download WebM</a> : null}
      </div>
      <audio ref={audioRef} className="radio-viz-audio" controls preload="metadata" />
    </section>
  );
}
