"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ayodhyaWireframeBoardExtraction } from "@shared/extracted-wireframes";

export function WireframeThreeConstellation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07101f);
    scene.fog = new THREE.Fog(0x07101f, 12, 64);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
    camera.position.set(0, 2.8, 25);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x07101f, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const goldLight = new THREE.PointLight(0xf8c75f, 2.2, 60);
    goldLight.position.set(0, 7, 12);
    scene.add(goldLight);
    const blueLight = new THREE.PointLight(0x2f80ed, 1.8, 60);
    blueLight.position.set(-8, -4, 10);
    scene.add(blueLight);

    const items = ayodhyaWireframeBoardExtraction.groups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.key })));
    const groupRoot = new THREE.Group();
    scene.add(groupRoot);
    const nodeGeometry = new THREE.BoxGeometry(0.5, 0.34, 0.08);
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xf8c75f, emissive: 0x221601, metalness: 0.18, roughness: 0.32 }),
      new THREE.MeshStandardMaterial({ color: 0x2f80ed, emissive: 0x06142d, metalness: 0.2, roughness: 0.36 }),
      new THREE.MeshStandardMaterial({ color: 0x46d893, emissive: 0x062318, metalness: 0.14, roughness: 0.4 })
    ];

    const nodes: THREE.Mesh[] = [];
    items.forEach((item, index) => {
      const ring = Math.floor(index / 8);
      const angle = index * Math.PI * 2 / Math.min(8 + ring * 2, 14);
      const radius = 3.4 + ring * 2.05;
      const node = new THREE.Mesh(nodeGeometry, materials[index % materials.length]);
      node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.42, Math.sin(index * 0.7) * 2.6);
      node.rotation.z = angle * 0.12;
      node.userData.label = `${item.code} ${item.name}`;
      groupRoot.add(node);
      nodes.push(node);
    });

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf8c75f, transparent: true, opacity: 0.2 });
    ayodhyaWireframeBoardExtraction.groups.forEach((group) => {
      const groupNodes = nodes.filter((node) => items[nodes.indexOf(node)]?.group === group.key);
      for (let i = 1; i < groupNodes.length; i += 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints([groupNodes[0].position, groupNodes[i].position]);
        groupRoot.add(new THREE.Line(geometry, lineMaterial));
      }
    });

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(Float32Array.from({ length: 1200 }, () => (Math.random() - 0.5) * 34), 3));
    scene.add(new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xf8c75f, size: 0.025, transparent: true, opacity: 0.24 })));

    const resize = () => {
      const parent = canvas.parentElement;
      const width = Math.max(320, parent?.clientWidth || 900);
      const height = Math.max(280, parent?.clientHeight || 420);
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
      groupRoot.rotation.y = Math.sin(t * 0.22) * 0.18;
      groupRoot.rotation.z = Math.sin(t * 0.16) * 0.04;
      nodes.forEach((node, index) => {
        node.scale.y = 1 + Math.sin(t * 1.4 + index) * 0.12;
      });
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
    <section className="wireframe-three-stage">
      <canvas ref={canvasRef} aria-label="Ayodhya AI wireframe archetype Three.js constellation" />
      <div>
        <span>React Three.js Absorption</span>
        <h2>41 archetypes as a living UX constellation</h2>
        <p>Each node maps to one uploaded `UW-*` wireframe. Group lines preserve category structure while keeping every extracted claim in draft state.</p>
      </div>
    </section>
  );
}
