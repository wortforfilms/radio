"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    THREE?: any;
    webkitAudioContext?: typeof AudioContext;
  }
}

type SceneName = "sphere" | "bars" | "particles";

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
        {(["sphere", "bars", "particles"] as SceneName[]).map((name) => (
          <button className={sceneName === name ? "active" : ""} data-viz-scene={name} key={name} onClick={() => setSceneName(name)}>
            {name === "sphere" ? "Sphere" : name === "bars" ? "32 Bars" : "500 Particles"}
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
