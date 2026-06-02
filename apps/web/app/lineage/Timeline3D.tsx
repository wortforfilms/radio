"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Circle,
  FastForward,
  Pause,
  Play,
  Rewind,
  RotateCcw,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
  Video,
  VideoOff
} from "lucide-react";
import * as THREE from "three";

type TimelineNode = {
  id: string;
  label: string;
  type: string;
  verificationStatus: string;
};

type VarianceTrack = "geological" | "political" | "astronomical";

type VariancePoint = {
  index: number;
  label: string;
  geological: number;
  political: number;
  astronomical: number;
};

type Timeline3DProps = {
  nodes: TimelineNode[];
  edgeCount: number;
};

declare global {
  interface Window {
    __timeline3dStats?: {
      frameCount: number;
      width: number;
      height: number;
      distinctPixelSamples: number;
      sampled: boolean;
      lastSampledAt: number;
    };
  }
}

const NODE_COLORS: Record<string, number> = {
  RISHI: 0x2c7a62,
  RISHIKA: 0x9a4660,
  CIVILIZATION: 0x2c5f88,
  SUBJECT: 0x8f6426,
  TEXT: 0x5b5f85,
  PITRA: 0x6b6a32,
  GURU_MAATAA: 0x8a5127
};

export default function Timeline3D({ nodes, edgeCount }: Timeline3DProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const markerRef = useRef<THREE.Mesh | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const progressRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef(1);
  const activeIndexRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState<VarianceTrack>("geological");

  const timelineNodes = useMemo(() => {
    if (nodes.length > 0) return nodes.slice(0, 64);
    return [
      { id: "placeholder-1", label: "No persisted lineage nodes yet", type: "UNKNOWN", verificationStatus: "UNKNOWN" },
      { id: "placeholder-2", label: "Import or seed verified claims", type: "UNKNOWN", verificationStatus: "UNKNOWN" }
    ];
  }, [nodes]);

  const varianceSeries = useMemo(() => buildVarianceSeries(timelineNodes), [timelineNodes]);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    window.__timeline3dStats = {
      frameCount: 0,
      width: 0,
      height: 0,
      distinctPixelSamples: 0,
      sampled: false,
      lastSampledAt: Date.now()
    };
    host.dataset.timelineStats = JSON.stringify(window.__timeline3dStats);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101713);
    scene.fog = new THREE.Fog(0x101713, 18, 72);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 200);
    camera.position.set(0, 9, 24);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const ambient = new THREE.AmbientLight(0xffffff, 0.56);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(8, 14, 12);
    scene.add(key);

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    const railMaterial = new THREE.MeshStandardMaterial({ color: 0xc9d8cf, metalness: 0.25, roughness: 0.5 });
    const rail = new THREE.Mesh(new THREE.BoxGeometry(Math.max(12, timelineNodes.length * 1.65), 0.08, 0.08), railMaterial);
    rail.position.y = -0.34;
    group.add(rail);

    const nodeGeometry = new THREE.SphereGeometry(0.34, 32, 18);
    const labelSprites: THREE.Sprite[] = [];
    const startX = -((timelineNodes.length - 1) * 1.65) / 2;
    addVarianceRibbons(group, varianceSeries, startX);

    timelineNodes.forEach((node, index) => {
      const color = NODE_COLORS[node.type] ?? 0x738179;
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: node.verificationStatus === "VERIFIED" ? 0.18 : 0.05,
        roughness: 0.38,
        metalness: 0.18
      });
      const mesh = new THREE.Mesh(nodeGeometry, material);
      mesh.position.set(startX + index * 1.65, Math.sin(index * 0.85) * 1.2, Math.cos(index * 0.7) * 1.6);
      mesh.userData = node;
      group.add(mesh);

      const stem = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, Math.abs(mesh.position.y + 0.34), 0.025),
        new THREE.MeshStandardMaterial({ color: 0x7c8a83, roughness: 0.7 })
      );
      stem.position.set(mesh.position.x, (mesh.position.y - 0.34) / 2, mesh.position.z);
      group.add(stem);

      if (index % Math.ceil(timelineNodes.length / 12) === 0) {
        const sprite = makeLabelSprite(node.label);
        sprite.position.set(mesh.position.x, mesh.position.y + 0.78, mesh.position.z);
        labelSprites.push(sprite);
        group.add(sprite);
      }
    });

    const marker = new THREE.Mesh(
      new THREE.TorusGeometry(0.64, 0.035, 12, 48),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xddeee5, emissiveIntensity: 0.35 })
    );
    marker.rotation.x = Math.PI / 2;
    markerRef.current = marker;
    group.add(marker);

    const grid = new THREE.GridHelper(42, 28, 0x56635d, 0x2e3833);
    grid.position.y = -0.42;
    scene.add(grid);

    marker.position.set(startX, Math.sin(0) * 1.2, Math.cos(0) * 1.6);
    renderer.render(scene, camera);
    window.__timeline3dStats = sampleCanvasPixels(renderer, 1);
    host.dataset.timelineStats = JSON.stringify(window.__timeline3dStats);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      window.__timeline3dStats = sampleCanvasPixels(renderer, 0);
      host.dataset.timelineStats = JSON.stringify(window.__timeline3dStats);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    let frame = 0;
    let frameCount = 0;
    let last = performance.now();
    const render = (now: number) => {
      frameCount += 1;
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playingRef.current) {
        progressRef.current = (progressRef.current + delta * 0.18 * speedRef.current) % 1;
      }
      const rawIndex = Math.round(progressRef.current * (timelineNodes.length - 1));
      if (rawIndex !== activeIndexRef.current) {
        activeIndexRef.current = rawIndex;
        setActiveIndex(rawIndex);
      }
      const activeX = startX + rawIndex * 1.65;
      if (markerRef.current) {
        markerRef.current.position.set(activeX, Math.sin(rawIndex * 0.85) * 1.2, Math.cos(rawIndex * 0.7) * 1.6);
        markerRef.current.rotation.z += delta * 1.8;
      }
      if (groupRef.current) {
        groupRef.current.rotation.y = Math.sin(now * 0.00018) * 0.22;
      }
      labelSprites.forEach((sprite) => {
        sprite.quaternion.copy(camera.quaternion);
      });
      renderer.render(scene, camera);
      if (frameCount % 30 === 0) {
        window.__timeline3dStats = sampleCanvasPixels(renderer, frameCount);
        host.dataset.timelineStats = JSON.stringify(window.__timeline3dStats);
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.dispose();
      nodeGeometry.dispose();
      railMaterial.dispose();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material?.dispose?.();
      });
    };
  }, [timelineNodes, varianceSeries]);

  const jumpTo = (index: number) => {
    const safeIndex = Math.max(0, Math.min(timelineNodes.length - 1, index));
    progressRef.current = timelineNodes.length <= 1 ? 0 : safeIndex / (timelineNodes.length - 1);
    setActiveIndex(safeIndex);
  };

  const captureScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `vaishviq-lineage-timeline-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const toggleRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      return;
    }
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      setIsRecording(false);
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `vaishviq-lineage-timeline-${Date.now()}.webm`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    };
    recorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const activeNode = timelineNodes[activeIndex] ?? timelineNodes[0];
  const activeVariance = varianceSeries[activeIndex] ?? varianceSeries[0];

  return (
    <section className="timeline3d-shell">
      <div className="timeline3d-stage" ref={hostRef}>
        <canvas ref={canvasRef} aria-label="Three dimensional knowledge lineage timeline" />
        <div className="timeline3d-overlay">
          <div>
            <span className="timeline3d-kicker">Three.js Timeline</span>
            <h1>Lineage Time Navigator</h1>
            <p>{timelineNodes.length} nodes / {edgeCount} lineage edges / {activeNode?.verificationStatus ?? "UNKNOWN"}</p>
          </div>
          <div className="timeline3d-active">
            <span>Active Node</span>
            <strong>{activeNode?.label}</strong>
            <small>{activeNode?.type}</small>
          </div>
        </div>
        <div className="variance-panel">
          <div className="variance-panel-head">
            <span>Variance Through Time</span>
            <strong>{trackTitle(selectedTrack)}</strong>
          </div>
          <div className="variance-tabs" aria-label="Variance chart tracks">
            {(["geological", "political", "astronomical"] as const).map((track) => (
              <button
                className={selectedTrack === track ? "is-active" : ""}
                key={track}
                type="button"
                onClick={() => setSelectedTrack(track)}
              >
                {track}
              </button>
            ))}
          </div>
          <VarianceChart
            activeIndex={activeIndex}
            points={varianceSeries}
            track={selectedTrack}
          />
          <div className="variance-readout">
            <span>Geological <b>{formatVariance(activeVariance?.geological)}</b></span>
            <span>Political <b>{formatVariance(activeVariance?.political)}</b></span>
            <span>Astronomical <b>{formatVariance(activeVariance?.astronomical)}</b></span>
          </div>
          <p>Runtime index derived from persisted node labels, types, and verification state. Cited domain datasets can replace this layer when imported.</p>
        </div>
        <div className="timeline3d-controls" aria-label="Timeline controls">
          <IconButton label="Rewind" onClick={() => jumpTo(0)}><Rewind size={18} /></IconButton>
          <IconButton label="Step back" onClick={() => jumpTo(activeIndex - 1)}><StepBack size={18} /></IconButton>
          <IconButton label={isPlaying ? "Pause" : "Play"} onClick={() => setIsPlaying((value) => !value)}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </IconButton>
          <IconButton label="Step forward" onClick={() => jumpTo(activeIndex + 1)}><StepForward size={18} /></IconButton>
          <IconButton label="Fast forward" onClick={() => jumpTo(timelineNodes.length - 1)}><FastForward size={18} /></IconButton>
          <IconButton label="Previous chapter" onClick={() => jumpTo(activeIndex - 8)}><SkipBack size={18} /></IconButton>
          <IconButton label="Next chapter" onClick={() => jumpTo(activeIndex + 8)}><SkipForward size={18} /></IconButton>
          <IconButton label="Reset view" onClick={() => jumpTo(0)}><RotateCcw size={18} /></IconButton>
          <IconButton label="Screenshot" onClick={captureScreenshot}><Camera size={18} /></IconButton>
          <IconButton label={isRecording ? "Stop recording" : "Record"} onClick={toggleRecording}>
            {isRecording ? <VideoOff size={18} /> : <Video size={18} />}
          </IconButton>
          <label className="timeline3d-speed">
            <span>Speed</span>
            <input
              min="0.25"
              max="3"
              step="0.25"
              type="range"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
            <b>{speed.toFixed(2)}x</b>
          </label>
          <span className={isRecording ? "record-dot is-recording" : "record-dot"}><Circle size={10} fill="currentColor" /></span>
        </div>
      </div>
    </section>
  );
}

function VarianceChart({ activeIndex, points, track }: { activeIndex: number; points: VariancePoint[]; track: VarianceTrack }) {
  const width = 420;
  const height = 150;
  const path = makeChartPath(points, track, width, height);
  const activeX = points.length <= 1 ? 0 : (activeIndex / (points.length - 1)) * width;
  const color = trackColor(track);

  return (
    <svg className="variance-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${track} variance chart`}>
      <defs>
        <linearGradient id={`variance-${track}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((line) => (
        <line className="variance-grid-line" key={line} x1="0" x2={width} y1={height * line} y2={height * line} />
      ))}
      <path d={path} fill="none" stroke={`url(#variance-${track})`} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <line className="variance-active-line" x1={activeX} x2={activeX} y1="0" y2={height} />
      <circle cx={activeX} cy={valueToY(points[activeIndex]?.[track] ?? 0, height)} fill={color} r="5" />
    </svg>
  );
}

function IconButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button className="icon-button" type="button" onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

function makeLabelSprite(label: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "rgba(12, 18, 15, 0.72)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(255, 255, 255, 0.34)";
    context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    context.fillStyle = "white";
    context.font = "600 34px Inter, system-ui, sans-serif";
    context.fillText(trimLabel(label), 24, 74);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.2, 0.8, 1);
  return sprite;
}

function buildVarianceSeries(nodes: TimelineNode[]): VariancePoint[] {
  return nodes.map((node, index) => {
    const text = `${node.label} ${node.type}`.toLowerCase();
    const verifiedLift = node.verificationStatus === "VERIFIED" ? 0.12 : 0;
    const geologicalAffinity = scoreText(text, [
      "geo",
      "earth",
      "location",
      "civilization",
      "ecology",
      "regional",
      "bharatiya",
      "vedic"
    ]);
    const politicalAffinity = scoreText(text, [
      "politic",
      "governance",
      "civilization",
      "institution",
      "community",
      "command",
      "audit",
      "parampara"
    ]);
    const astronomicalAffinity = scoreText(text, [
      "astro",
      "jyotisha",
      "time",
      "timeline",
      "cosmic",
      "veda",
      "knowledge",
      "future"
    ]);

    return {
      index,
      label: node.label,
      geological: clamp01(0.24 + geologicalAffinity + wave(index, 0.19, 0.18) + verifiedLift),
      political: clamp01(0.22 + politicalAffinity + wave(index, 0.31, 0.15) + verifiedLift),
      astronomical: clamp01(0.25 + astronomicalAffinity + wave(index, 0.43, 0.2) + verifiedLift)
    };
  });
}

function addVarianceRibbons(group: THREE.Group, points: VariancePoint[], startX: number) {
  const tracks: Array<{ key: VarianceTrack; color: number; z: number }> = [
    { key: "geological", color: 0x80b96f, z: -3.2 },
    { key: "political", color: 0xd08b58, z: -4.4 },
    { key: "astronomical", color: 0x78a8e8, z: -5.6 }
  ];

  tracks.forEach((track) => {
    const curvePoints = points.map((point, index) => {
      const x = startX + index * 1.65;
      const y = -2.15 + point[track.key] * 2.2;
      return new THREE.Vector3(x, y, track.z);
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const material = new THREE.LineBasicMaterial({
      color: track.color,
      transparent: true,
      opacity: 0.82
    });
    const line = new THREE.Line(geometry, material);
    group.add(line);
  });
}

function makeChartPath(points: VariancePoint[], track: VarianceTrack, width: number, height: number) {
  if (points.length === 0) return "";
  return points
    .map((point, index) => {
      const x = points.length <= 1 ? 0 : (index / (points.length - 1)) * width;
      const y = valueToY(point[track], height);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function valueToY(value: number, height: number) {
  return height - clamp01(value) * (height - 14) - 7;
}

function trackColor(track: VarianceTrack) {
  if (track === "geological") return "#9bcf83";
  if (track === "political") return "#d89a69";
  return "#83b4f2";
}

function trackTitle(track: VarianceTrack) {
  if (track === "geological") return "Geological Variance";
  if (track === "political") return "Political Variance";
  return "Astronomical Variance";
}

function formatVariance(value?: number) {
  return `${Math.round((value ?? 0) * 100)}`;
}

function scoreText(text: string, keywords: string[]) {
  const hits = keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
  return Math.min(0.46, hits * 0.115);
}

function wave(index: number, frequency: number, amplitude: number) {
  return ((Math.sin(index * frequency) + 1) / 2) * amplitude;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function sampleCanvasPixels(renderer: THREE.WebGLRenderer, frameCount: number) {
  const size = renderer.getSize(new THREE.Vector2());
  const base = {
    frameCount,
    width: Math.round(size.x),
    height: Math.round(size.y),
    distinctPixelSamples: 0,
    sampled: false,
    lastSampledAt: Date.now()
  };
  try {
    const gl = renderer.getContext();
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const points = [
      [Math.floor(width * 0.5), Math.floor(height * 0.5)],
      [Math.floor(width * 0.25), Math.floor(height * 0.45)],
      [Math.floor(width * 0.75), Math.floor(height * 0.45)],
      [Math.floor(width * 0.5), Math.floor(height * 0.7)],
      [24, 24]
    ];
    const pixel = new Uint8Array(4);
    const samples = new Set<string>();
    for (const [x, y] of points) {
      gl.readPixels(
        Math.max(0, Math.min(width - 1, x)),
        Math.max(0, Math.min(height - 1, y)),
        1,
        1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixel
      );
      samples.add(`${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]}`);
    }
    return {
      ...base,
      width,
      height,
      distinctPixelSamples: samples.size,
      sampled: true
    };
  } catch {
    return base;
  }
}

function trimLabel(label: string) {
  return label.length > 24 ? `${label.slice(0, 22)}...` : label;
}
