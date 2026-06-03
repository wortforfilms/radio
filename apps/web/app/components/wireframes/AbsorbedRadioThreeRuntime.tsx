"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { radioImageHtmlExtraction } from "@shared/extracted-wireframes";

const stationNames = ["Mahamatya", "Gokul", "Namata", "Satitona-23"];
const tracks = ["THE SWARNIM SALE", "THE SWARNIM SALE", "THE SWARNIM SALE", "THE SWARNIM SALE", "THE SWARNIM SALE"];

export function AbsorbedRadioThreeRuntime() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spectrumBars = useMemo(() => Array.from({ length: radioImageHtmlExtraction.counts.generatedSpectrumBars }, (_, index) => {
    return 24 + Math.abs(Math.sin(index * 0.55)) * 78 + (index % 5) * 3;
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b10);
    scene.fog = new THREE.Fog(0x050b10, 18, 70);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
    camera.position.set(0, 5.4, 22);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050b10, 0);

    const root = new THREE.Group();
    scene.add(root);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const cyan = new THREE.PointLight(0x6ee7ff, 2.4, 60);
    cyan.position.set(-8, 5, 10);
    scene.add(cyan);
    const amber = new THREE.PointLight(0xff7b3a, 2.2, 60);
    amber.position.set(9, 4, 8);
    scene.add(amber);

    const tuner = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.08, 18, 160),
      new THREE.MeshStandardMaterial({ color: 0x6ee7ff, emissive: 0x10394a, metalness: 0.25, roughness: 0.24 })
    );
    root.add(tuner);
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.34, 3),
      new THREE.MeshStandardMaterial({ color: 0xff7b3a, emissive: 0x421403, metalness: 0.12, roughness: 0.28, wireframe: true })
    );
    root.add(inner);

    const waveGeometry = new THREE.BufferGeometry();
    const wavePoints = Array.from({ length: 180 }, (_, index) => {
      const x = -11 + index * 22 / 179;
      return new THREE.Vector3(x, Math.sin(index * 0.18) * 0.55, -3.4);
    });
    waveGeometry.setFromPoints(wavePoints);
    const wave = new THREE.Line(
      waveGeometry,
      new THREE.LineBasicMaterial({ color: 0x6ee7ff, transparent: true, opacity: 0.75 })
    );
    root.add(wave);

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(Float32Array.from({ length: 900 }, () => (Math.random() - 0.5) * 26), 3)
    );
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: 0x6ee7ff, size: 0.035, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending })
    );
    root.add(particles);

    const radarGroup = new THREE.Group();
    radarGroup.position.set(8.2, -2.2, -1.5);
    for (let i = 0; i < 7; i += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.42 + i * 0.28, 0.01, 8, 80),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff7b3a : 0x6ee7ff, transparent: true, opacity: 0.36 })
      );
      radarGroup.add(ring);
    }
    root.add(radarGroup);

    const resize = () => {
      const parent = canvas.parentElement;
      const width = Math.max(320, parent?.clientWidth || 900);
      const height = Math.max(280, parent?.clientHeight || 520);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      tuner.rotation.z = t * 0.32;
      inner.rotation.x = t * 0.42;
      inner.rotation.y = t * 0.36;
      particles.rotation.y = t * 0.04;
      radarGroup.rotation.z = -t * 0.52;
      const positions = waveGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 180; i += 1) {
        positions[i * 3 + 1] = Math.sin(i * 0.18 + t * 2.2) * 0.55 + Math.sin(i * 0.04 - t) * 0.22;
      }
      waveGeometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material?.dispose?.();
      });
    };
  }, []);

  return (
    <main className="absorbed-radio-shell">
      <canvas ref={canvasRef} aria-label="Absorbed Radio Vaigyaaniq Three.js frame" />
      <aside className="absorbed-radio-rail">
        <b>≡</b>
        {["⌂", "◎", "▣", "◌", "♢", "⚙"].map((item, index) => <span className={index === 0 ? "active" : ""} key={item}>{item}</span>)}
      </aside>
      <section className="absorbed-radio-wrap">
        <section className="absorbed-radio-grid">
          <div>
            <div className="absorbed-yantra" />
            <article className="absorbed-card absorbed-library">
              <h2>Sonic Library</h2>
              {tracks.map((track, index) => (
                <div className={index === 3 ? "active" : ""} key={`${track}-${index}`}>
                  <span>{index + 1}</span>
                  <b>{track}</b>
                  <small>{index === 3 ? "LIVE" : `${10 - index}bps`}</small>
                </div>
              ))}
            </article>
          </div>
          <div>
            <header className="absorbed-brand">
              <h1>RADIO <span>VAIGYAANIQ</span></h1>
              <p>Discover the Science, Tune into the Future.</p>
            </header>
            <article className="absorbed-card absorbed-tuner-card">
              <span>Quantum Resonance Tuner</span>
              <div className="absorbed-frequency"><small>Frequency</small><b>102.5</b><small>MHz</small></div>
              <button type="button">Play</button>
              <p>Local Runtime Guidance</p>
            </article>
            <section className="absorbed-stations">
              <h2>Station Grid <span>Resonance Catalog</span></h2>
              <div>
                {Array.from({ length: radioImageHtmlExtraction.counts.stationCards }, (_, index) => (
                  <article className="absorbed-card" key={index}>
                    <small>{index < 4 ? `${28 + index * 7} Tracks` : "Track count"}</small>
                    <b>{index < 4 ? ["☌", "♬", "☸", "◎"][index] : stationNames[index - 4]}</b>
                    <span>Active</span>
                  </article>
                ))}
              </div>
            </section>
          </div>
          <div>
            <section className="absorbed-samaya">
              <div className="absorbed-earth" />
              <div>
                <b>Current Samaya State</b>
                <h2>00:54 h 64</h2>
                <p>Hobal Samaya State</p>
                <span>DRAFT</span><span>NULL</span>
              </div>
            </section>
            <article className="absorbed-card absorbed-samaya-card">
              <h2>Hemant Samwat Samaya layer</h2>
              <p>Computed temporal information. Computed stated states remain draft.</p>
              <strong>Sarve Bhavantu ALL B<br />Sarve Bhavatu ALL B</strong>
            </article>
            <section className="absorbed-telemetry">
              <article>
                <h2>Catalyst Telemetry Radar</h2>
                <div className="absorbed-radar" />
              </article>
              <article>
                <h2>Live Spectrum</h2>
                <div className="absorbed-spectrum">
                  {spectrumBars.map((height, index) => <i style={{ height }} key={index} />)}
                </div>
              </article>
            </section>
          </div>
        </section>
      </section>
      <div className="absorbed-stalk"><b>CONTROL STALK</b><span>PCU-01 · STATUS OPERATIONAL</span></div>
      <footer className="absorbed-player">
        <div><b>THE SWARNIM SALE</b><span>Gokul - Rise of Resistance · LIVE</span></div>
        <nav><button>‹</button><button>Ⅱ</button><button>›</button></nav>
        <div><span>LIKE</span><span>SAVE</span><span>GIFT</span></div>
      </footer>
    </main>
  );
}
