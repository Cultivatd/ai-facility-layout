import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, RotateCcw } from 'lucide-react';
import { useLayoutStore } from '../../store/layoutStore';
import { ROOM_CATEGORY_STYLES } from '../../utils/dimensions';
import { computeShellBounds } from '../canvas/canvasConstants';

type CameraPreset = 'iso-se' | 'iso-sw' | 'top-perspective' | 'dock-view';

function disposeHierarchy(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
}

export const IsometricPreview3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const renderSceneRef = useRef<(() => void) | null>(null);
  const cameraUpdateRef = useRef<((preset: CameraPreset) => void) | null>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);

  const layout = useLayoutStore((s) => s.layout);
  const [cutawayShellWalls, setCutawayShellWalls] = useState(true);
  const [activePreset, setActivePreset] = useState<CameraPreset>('iso-se');

  // 1. Initialize static Three.js engine & interaction listeners ONCE on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1500);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const renderScene = () => {
      renderer.render(scene, camera);
    };
    renderSceneRef.current = renderScene;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.15);
    dirLight.position.set(85, 130, 95);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
    fillLight.position.set(-70, 60, -50);
    scene.add(fillLight);

    // Ground Reference Grid (size 300 covers typical industrial bay)
    const gridHelper = new THREE.GridHelper(300, 30, 0x1e293b, 0x111827);
    gridHelper.position.set(0, -0.2, 0);
    scene.add(gridHelper);

    // Persistent Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Interactive Orbit Camera State
    let spherical = {
      radius: 120,
      phi: Math.PI / 3.1, // polar angle from Y axis
      theta: Math.PI / 4.2, // azimuth angle
    };
    let target = new THREE.Vector3(0, 4, 0);

    const updateCameraFromSpherical = () => {
      const sinPhi = Math.sin(spherical.phi);
      camera.position.x = target.x + spherical.radius * sinPhi * Math.sin(spherical.theta);
      camera.position.y = target.y + spherical.radius * Math.cos(spherical.phi);
      camera.position.z = target.z + spherical.radius * sinPhi * Math.cos(spherical.theta);
      camera.lookAt(target);
      renderScene();
    };

    const applyPreset = (preset: CameraPreset) => {
      switch (preset) {
        case 'iso-se':
          spherical.phi = Math.PI / 3.2;
          spherical.theta = Math.PI / 4.2;
          break;
        case 'iso-sw':
          spherical.phi = Math.PI / 3.2;
          spherical.theta = -Math.PI / 4.2;
          break;
        case 'dock-view':
          spherical.phi = Math.PI / 2.3;
          spherical.theta = 0.05;
          break;
        case 'top-perspective':
          spherical.phi = 0.12;
          spherical.theta = 0;
          break;
      }
      updateCameraFromSpherical();
    };
    cameraUpdateRef.current = applyPreset;
    resetCameraRef.current = () => applyPreset('iso-se');

    updateCameraFromSpherical();

    // Mouse Drag Orbit Controls
    let isPointerDown = false;
    let lastX = 0;
    let lastY = 0;
    const domElem = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      if (e.buttons === 2 || e.shiftKey) {
        // Pan Target
        const panSpeed = 0.08 * (spherical.radius / 100);
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
        target.addScaledVector(right, -dx * panSpeed);
        target.y += dy * panSpeed;
      } else {
        // Orbit
        const rotSpeed = 0.006;
        spherical.theta -= dx * rotSpeed;
        spherical.phi = Math.max(0.05, Math.min(Math.PI / 2.05, spherical.phi - dy * rotSpeed));
      }
      updateCameraFromSpherical();
    };

    const onPointerUp = () => {
      isPointerDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(35, Math.min(450, spherical.radius + e.deltaY * 0.08));
      updateCameraFromSpherical();
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });
    domElem.addEventListener('contextmenu', onContextMenu);

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw > 0 && nh > 0) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
        renderScene();
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('contextmenu', onContextMenu);

      if (modelGroupRef.current) {
        disposeHierarchy(modelGroupRef.current);
        modelGroupRef.current.clear();
      }
      gridHelper.geometry.dispose();
      (gridHelper.material as THREE.Material).dispose();
      renderer.dispose();
      if (domElem.parentElement) {
        domElem.parentElement.removeChild(domElem);
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      modelGroupRef.current = null;
    };
  }, []);

  // 2. Rebuild dynamic facility geometry on layout/settings changes without re-creating WebGLRenderer
  useEffect(() => {
    const modelGroup = modelGroupRef.current;
    const renderScene = renderSceneRef.current;
    if (!modelGroup || !renderScene) return;

    // Safely dispose all existing meshes in modelGroup
    disposeHierarchy(modelGroup);
    modelGroup.clear();

    const shellBounds = computeShellBounds(layout.shellPerimeter);
    const centerX = shellBounds.centerXFt;
    const centerZ = shellBounds.centerYFt;

    // Shift so center of facility is at world (0, 0, 0)
    modelGroup.position.set(-centerX, 0, -centerZ);

    // 1. Concrete Slab Polygon from shellPerimeter
    if (layout.shellPerimeter.length >= 3) {
      try {
        const shape = new THREE.Shape();
        layout.shellPerimeter.forEach((pt, idx) => {
          if (idx === 0) shape.moveTo(pt.x, pt.y);
          else shape.lineTo(pt.x, pt.y);
        });
        shape.closePath();

        const slabGeom = new THREE.ExtrudeGeometry(shape, {
          depth: 0.6,
          bevelEnabled: false,
        });
        slabGeom.rotateX(Math.PI / 2);
        const slabMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.85,
          metalness: 0.1,
        });
        const slabMesh = new THREE.Mesh(slabGeom, slabMat);
        slabMesh.position.y = 0;
        slabMesh.receiveShadow = true;
        modelGroup.add(slabMesh);
      } catch (err) {
        console.warn('Could not extrude shell slab in 3D preview:', err);
      }
    }

    // 2. Shell Perimeter Walls
    const shellHeight = layout.metadata.clearHeightFt || 18;
    const pts = layout.shellPerimeter;
    const eastThreshold = shellBounds.maxXFt - 3.5;
    const southThreshold = shellBounds.maxYFt - 2.0;

    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if (segLen < 0.1) continue;

      const isEastOrSouth =
        (p1.x >= eastThreshold && p2.x >= eastThreshold) ||
        (p1.y >= southThreshold && p2.y >= southThreshold);
      const wallH = cutawayShellWalls && isEastOrSouth ? 3.5 : shellHeight;

      const geom = new THREE.BoxGeometry(segLen, wallH, 0.75);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.65,
        transparent: cutawayShellWalls && isEastOrSouth,
        opacity: cutawayShellWalls && isEastOrSouth ? 0.45 : 0.92,
      });
      const wall = new THREE.Mesh(geom, mat);
      const midX = (p1.x + p2.x) / 2;
      const midZ = (p1.y + p2.y) / 2;
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

      wall.position.set(midX, wallH / 2, midZ);
      wall.rotation.y = -angle;
      wall.castShadow = true;
      wall.receiveShadow = true;
      modelGroup.add(wall);
    }

    // 3. Rooms (Floor Zone Pad + Partition Walls)
    layout.rooms.forEach((room) => {
      const catStyle =
        ROOM_CATEGORY_STYLES[room.category] ?? ROOM_CATEGORY_STYLES.production;
      const colorHex = room.color || catStyle.fill3D;
      const threeColor = new THREE.Color(colorHex);

      // Floor Zone Pad
      const padGeom = new THREE.BoxGeometry(Math.max(0.5, room.width - 0.15), 0.18, Math.max(0.5, room.height - 0.15));
      const padMat = new THREE.MeshStandardMaterial({
        color: threeColor,
        roughness: 0.5,
        metalness: 0.08,
      });
      const padMesh = new THREE.Mesh(padGeom, padMat);
      padMesh.position.set(
        room.x + room.width / 2,
        0.09,
        room.y + room.height / 2
      );
      padMesh.receiveShadow = true;
      modelGroup.add(padMesh);

      // Translucent Partition Volume + Wireframe Top Rim
      const wallH = room.wallHeight || 10;
      const boxGeom = new THREE.BoxGeometry(Math.max(0.5, room.width), wallH, Math.max(0.5, room.height));
      const boxMat = new THREE.MeshStandardMaterial({
        color: threeColor,
        transparent: true,
        opacity: room.category === 'production' || room.category === 'shipping' ? 0.12 : 0.28,
        roughness: 0.3,
      });
      const boxMesh = new THREE.Mesh(boxGeom, boxMat);
      boxMesh.position.set(
        room.x + room.width / 2,
        wallH / 2,
        room.y + room.height / 2
      );
      modelGroup.add(boxMesh);

      const edges = new THREE.EdgesGeometry(boxGeom);
      const lineMat = new THREE.LineBasicMaterial({ color: threeColor });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.copy(boxMesh.position);
      modelGroup.add(wireframe);
    });

    // 4. Structural Steel Column & Dock Pits
    layout.structuralElements.forEach((st) => {
      if (st.type === 'steel-column') {
        const colGeom = new THREE.CylinderGeometry(0.6, 0.6, shellHeight, 20);
        const colMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          metalness: 0.5,
          roughness: 0.4,
        });
        const colMesh = new THREE.Mesh(colGeom, colMat);
        colMesh.position.set(
          st.x + st.width / 2,
          shellHeight / 2,
          st.y + st.height / 2
        );
        colMesh.castShadow = true;
        modelGroup.add(colMesh);
      } else if (st.type === 'dock-leveler-pit') {
        const pitGeom = new THREE.BoxGeometry(st.width, 0.16, st.height);
        const pitMat = new THREE.MeshStandardMaterial({
          color: 0xf97316,
          roughness: 0.7,
        });
        const pitMesh = new THREE.Mesh(pitGeom, pitMat);
        pitMesh.position.set(
          st.x + st.width / 2,
          0.1,
          st.y + st.height / 2
        );
        modelGroup.add(pitMesh);
      } else if (st.type === 'partition-wall') {
        const pWallH = st.isExisting ? shellHeight : 12;
        const pGeom = new THREE.BoxGeometry(st.width, pWallH, st.height);
        const pMat = new THREE.MeshStandardMaterial({
          color: st.isExisting ? 0x64748b : 0xd97706,
          transparent: true,
          opacity: st.isExisting ? 0.85 : 0.65,
          roughness: 0.4,
        });
        const pMesh = new THREE.Mesh(pGeom, pMat);
        pMesh.position.set(
          st.x + st.width / 2,
          pWallH / 2,
          st.y + st.height / 2
        );
        modelGroup.add(pMesh);
      }
    });

    // 5. Doors (3D Frames)
    layout.doors.forEach((d) => {
      const doorH = d.type === 'overhead-dock' ? 9.5 : 7.0;
      const isHoriz = d.orientation === 'horizontal';
      const geom = new THREE.BoxGeometry(
        isHoriz ? d.width : 0.45,
        doorH,
        isHoriz ? 0.45 : d.width
      );
      const mat = new THREE.MeshStandardMaterial({
        color: d.type === 'overhead-dock' ? 0xf97316 : 0xfacc15,
        transparent: true,
        opacity: 0.78,
      });
      const doorMesh = new THREE.Mesh(geom, mat);
      doorMesh.position.set(d.x, doorH / 2, d.y);
      modelGroup.add(doorMesh);
    });

    // 6. 3D Industrial Equipment & Racking
    layout.equipment.forEach((eq) => {
      const eqH = eq.elevationHeight || 4;
      const eqColor =
        eq.category === 'machinery'
          ? 0x3b82f6
          : eq.category === 'racking'
          ? 0xf59e0b
          : eq.category === 'electrical-mep'
          ? 0xef4444
          : 0x94a3b8;

      const geom = new THREE.BoxGeometry(eq.width, eqH, eq.height);
      const mat = new THREE.MeshStandardMaterial({
        color: eqColor,
        roughness: 0.4,
        metalness: 0.35,
      });
      const mesh = new THREE.Mesh(geom, mat);
      const rotRad = -((eq.rotation || 0) * Math.PI) / 180;
      mesh.position.set(eq.x + eq.width / 2, eqH / 2, eq.y + eq.height / 2);
      mesh.rotation.y = rotRad;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      modelGroup.add(mesh);

      const edges = new THREE.EdgesGeometry(geom);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xe2e8f0 })
      );
      line.position.copy(mesh.position);
      line.rotation.y = rotRad;
      modelGroup.add(line);
    });

    renderScene();
  }, [layout, cutawayShellWalls]);

  const handleSelectPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    cameraUpdateRef.current?.(preset);
  };

  const handleExport3DPng = () => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const dataUrl = renderer.domElement.toDataURL('image/png');
    const slug =
      (layout.metadata.suiteName || layout.metadata.projectName || 'facility')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'facility';
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${slug}-3d-isometric-render.png`;
    a.click();
  };

  return (
    <div className="relative flex-1 h-full bg-slate-950 overflow-hidden flex flex-col">
      {/* 3D Viewport Canvas */}
      <div ref={containerRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top-Left 3D Camera & Cutaway Controls */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700/80 p-1.5 rounded-lg text-xs shadow-xl">
        {(
          [
            ['iso-se', 'Isometric SE'],
            ['iso-sw', 'Isometric SW'],
            ['dock-view', 'South Docks'],
            ['top-perspective', 'Top 3D'],
          ] as [CameraPreset, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => handleSelectPreset(id)}
            className={`px-2.5 py-1 rounded font-medium transition ${
              activePreset === id
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {label}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <button
          onClick={() => setCutawayShellWalls((v) => !v)}
          className={`px-2.5 py-1 rounded font-medium transition ${
            cutawayShellWalls
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Cutaway perimeter walls on East and South sides for unobstructed interior view"
        >
          {cutawayShellWalls ? 'Cutaway Walls: ON' : 'Cutaway Walls: OFF'}
        </button>

        <button
          onClick={() => resetCameraRef.current?.()}
          className="p-1 rounded text-slate-400 hover:text-white transition"
          title="Reset Camera View to Default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Floating Info & High-Res Snapshot Export */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 shadow-xl flex items-center gap-2">
        <span>3D Perspective</span>
        <span>&bull;</span>
        <span>Drag Left-Click: Orbit</span>
        <span>&bull;</span>
        <span>Right-Click / Shift+Drag: Pan</span>
        <span>&bull;</span>
        <span>Scroll: Zoom</span>
      </div>

      <div className="absolute bottom-3 right-3">
        <button
          onClick={handleExport3DPng}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 text-xs font-medium transition shadow-xl"
        >
          <Camera className="w-3.5 h-3.5 text-blue-400" />
          <span>Export 3D Render</span>
        </button>
      </div>
    </div>
  );
};
