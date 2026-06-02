"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { HkdHeroBanner, HkdHeroBannerShape } from "@shared/hkd-hero-banners";

type Props = {
  banners: HkdHeroBanner[];
};

function color(value: string) {
  return new THREE.Color(value);
}

function makeMaterial(banner: HkdHeroBanner, accent = false) {
  return new THREE.MeshStandardMaterial({
    color: accent ? color(banner.accent) : color(banner.color),
    emissive: accent ? color(banner.accent) : color(banner.color),
    emissiveIntensity: 0.16,
    metalness: 0.54,
    roughness: 0.2
  });
}

function addShape(shape: HkdHeroBannerShape, banner: HkdHeroBanner) {
  const group = new THREE.Group();
  const primary = makeMaterial(banner);
  const accent = makeMaterial(banner, true);

  if (shape === "cube") {
    group.add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 1.7, 4, 4, 4), primary));
    group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 2), accent));
  } else if (shape === "tree") {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.8, 24), primary);
    trunk.position.y = -0.25;
    group.add(trunk);
    for (let index = 0; index < 7; index += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34 + index * 0.12, 0.015, 12, 96), index % 2 ? primary : accent);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.86 + index * 0.28;
      group.add(ring);
    }
  } else if (shape === "timeline" || shape === "bars") {
    for (let index = 0; index < 9; index += 1) {
      const block = new THREE.Mesh(new THREE.BoxGeometry(0.22, shape === "bars" ? 0.3 + index * 0.14 : 0.22, 0.34), index % 2 ? primary : accent);
      block.position.set((index - 4) * 0.28, shape === "bars" ? -0.7 + index * 0.08 : Math.sin(index) * 0.18, 0);
      group.add(block);
    }
  } else if (shape === "glyph" || shape === "portal") {
    for (let index = 0; index < 6; index += 1) {
      const torus = new THREE.Mesh(new THREE.TorusGeometry(0.28 + index * 0.14, 0.018, 12, 120), index % 2 ? primary : accent);
      torus.rotation.x = Math.PI / 2;
      torus.position.z = -index * 0.04;
      group.add(torus);
    }
  } else if (shape === "dna") {
    for (let index = 0; index < 42; index += 1) {
      const y = (index - 21) * 0.055;
      const angle = index * 0.42;
      const first = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), primary);
      const second = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), accent);
      first.position.set(Math.cos(angle) * 0.68, y, Math.sin(angle) * 0.68);
      second.position.set(Math.cos(angle + Math.PI) * 0.68, y, Math.sin(angle + Math.PI) * 0.68);
      group.add(first, second);
    }
  } else if (shape === "temple") {
    for (let index = 0; index < 5; index += 1) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.95, 20), primary);
      pillar.position.set((index - 2) * 0.28, -0.25, 0);
      group.add(pillar);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.62, 4), accent);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 0.44;
    group.add(roof);
  } else if (shape === "ui" || shape === "studio" || shape === "document") {
    for (let index = 0; index < (shape === "document" ? 1 : 4); index += 1) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.2, shape === "document" ? 1.62 : 0.62, 0.05), index % 2 ? primary : accent);
      panel.position.set((index % 2) * 0.34, Math.floor(index / 2) * 0.48 - 0.3, -index * 0.08);
      group.add(panel);
    }
  } else if (shape === "scales") {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.05), primary);
    group.add(beam);
    [-0.62, 0.62].forEach((x) => {
      const pan = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.015, 12, 72), accent);
      pan.rotation.x = Math.PI / 2;
      pan.position.set(x, -0.42, 0);
      group.add(pan);
    });
  } else if (shape === "shield") {
    const shield = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 2), primary);
    shield.scale.set(0.85, 1.15, 0.3);
    group.add(shield);
    group.add(new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 16), accent));
  } else if (shape === "market") {
    const cart = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.54, 0.62), primary);
    group.add(cart);
    [-0.42, 0.42].forEach((x) => {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.024, 12, 48), accent);
      wheel.position.set(x, -0.38, 0.32);
      group.add(wheel);
    });
  } else {
    group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 2), primary));
  }

  const base = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.02, 12, 120), accent);
  base.rotation.x = Math.PI / 2;
  base.position.y = -1.1;
  group.add(base);
  return group;
}

function HkdBannerCanvas({ banner, featured = false }: { banner: HkdHeroBanner; featured?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.05, 5.2);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const object = addShape(banner.shape, banner);
    object.position.x = featured ? 1.5 : 1.24;
    object.scale.setScalar(featured ? 1.05 : 0.9);
    scene.add(object);

    const particles = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(Float32Array.from({ length: 900 }, () => (Math.random() - 0.5) * 8), 3)
      ),
      new THREE.PointsMaterial({ color: banner.accent, size: 0.018, transparent: true, opacity: 0.42 })
    );
    scene.add(particles);
    scene.add(new THREE.PointLight(color(banner.color), 4.2, 14));
    const rim = new THREE.PointLight(color(banner.accent), 2.8, 14);
    rim.position.set(-2, 1, 2);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xffffff, color(banner.color), 1.1));

    const resize = () => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth ?? 720;
      const height = parent?.clientHeight ?? 330;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    let frame = 0;
    let tick = Math.random() * 10;
    const animate = () => {
      tick += 0.006;
      object.rotation.y += 0.006;
      object.rotation.x = Math.sin(tick) * 0.08;
      object.position.y = Math.sin(tick * 1.3) * 0.06;
      particles.rotation.y += 0.001;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    resize();
    window.addEventListener("resize", resize);
    animate();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    };
  }, [banner, featured]);

  return <canvas ref={canvasRef} aria-label={`${banner.title} Three.js banner`} />;
}

export default function HkdBannerGrid({ banners }: Props) {
  return (
    <section className="hkd-banner-grid" aria-label="HKD hero banner registry">
      {banners.map((banner, index) => (
        <article className={`hkd-banner-card ${index === 0 ? "is-featured" : ""}`} key={banner.key}>
          <HkdBannerCanvas banner={banner} featured={index === 0} />
          <div className="hkd-banner-content">
            <div>
              <div className="hkd-banner-title-row">
                <span>⬢</span>
                <div>
                  <h2>{banner.title}</h2>
                  <p>{banner.subtitle}</p>
                </div>
              </div>
              <div className="hkd-banner-tags">
                {banner.tags.map((tag) => (
                  <small key={tag}>{tag}</small>
                ))}
              </div>
              <h3>{banner.headline}</h3>
              <p>{banner.description}</p>
            </div>
            <div className="hkd-banner-actions">
              <button type="button">{banner.primaryAction}</button>
              <button type="button">{banner.secondaryAction}</button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
