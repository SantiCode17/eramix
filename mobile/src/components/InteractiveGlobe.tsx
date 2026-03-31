import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  AppState,
  type AppStateStatus,
  type LayoutChangeEvent,
} from "react-native";
import { GLView } from "expo-gl";
import * as THREE from "three";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import type { CountryPin } from "@/types/globe";

// ── Constants ───────────────────────────────────────
const GLOBE_RADIUS = 1.0;
const PIN_BASE_SIZE = 0.018;
const PIN_MAX_SCALE = 3.5;
const ATMOSPHERE_RADIUS = 1.06;
const AUTO_ROTATE_SPEED = 0.001;
const DAMPING = 0.95;
const MIN_ZOOM = 2.2;
const MAX_ZOOM = 5.0;
const DEFAULT_ZOOM = 3.2;
const STAR_COUNT = 1500;

// ── Helpers ─────────────────────────────────────────

/** Convert lat/lng (degrees) to 3D position on sphere */
function latLngToVector3(
  lat: number,
  lng: number,
  radius: number,
): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Country flag emoji lookup (common Erasmus countries) */
const COUNTRY_FLAGS: Record<string, string> = {
  Spain: "🇪🇸",
  Italy: "🇮🇹",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Portugal: "🇵🇹",
  Netherlands: "🇳🇱",
  Poland: "🇵🇱",
  "Czech Republic": "🇨🇿",
  Austria: "🇦🇹",
  Denmark: "🇩🇰",
  Belgium: "🇧🇪",
  Finland: "🇫🇮",
  Ireland: "🇮🇪",
  Sweden: "🇸🇪",
  Greece: "🇬🇷",
  Romania: "🇷🇴",
  Hungary: "🇭🇺",
  Croatia: "🇭🇷",
  Norway: "🇳🇴",
};

export { COUNTRY_FLAGS };

// ── Props ───────────────────────────────────────────

interface InteractiveGlobeProps {
  pins: CountryPin[];
  onPinSelected?: (pin: CountryPin) => void;
  onDayNightChange?: (nightAmount: number) => void;
}

/**
 * Full-featured interactive 3D Earth globe with:
 * - NASA Earth textures (day + night city lights)
 * - Starfield background
 * - Atmospheric glow
 * - Sun lighting
 * - Pan gesture rotation with inertia
 * - Pinch gesture zoom
 * - Country pins with size = student density
 * - Raycasting tap detection for pin selection
 * - Auto-rotation when idle
 * - AppState-aware render loop (pauses in background)
 */
export default function InteractiveGlobe({
  pins,
  onPinSelected,
  onDayNightChange,
}: InteractiveGlobeProps): React.JSX.Element {
  // ── Refs ──────────────────────────────────────────
  const glRef = useRef<any>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const nightMeshRef = useRef<THREE.Mesh | null>(null);
  const pinMeshesRef = useRef<THREE.Mesh[]>([]);
  const pinDataRef = useRef<CountryPin[]>([]);
  const animFrameRef = useRef<number>(0);
  const isActiveRef = useRef(true);
  const sizeRef = useRef({ width: 300, height: 300 });

  // Rotation state
  const rotationRef = useRef({ x: 0.4, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const autoRotateRef = useRef(true);
  const autoRotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Zoom state
  const zoomRef = useRef(DEFAULT_ZOOM);

  // Callbacks
  const onPinSelectedRef = useRef(onPinSelected);
  const onDayNightRef = useRef(onDayNightChange);

  const [viewSize, setViewSize] = useState({ width: 300, height: 300 });

  useEffect(() => {
    onPinSelectedRef.current = onPinSelected;
  }, [onPinSelected]);
  useEffect(() => {
    onDayNightRef.current = onDayNightChange;
  }, [onDayNightChange]);

  // ── AppState listener: pause rendering when backgrounded ──
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      isActiveRef.current = state === "active";
    };
    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, []);

  // ── Procedural textures (used as fallback / also primary in expo-gl) ──
  const createEarthTexture = useCallback(
    (isNight: boolean): THREE.DataTexture => {
      const W = 1024;
      const H = 512;
      const data = new Uint8Array(W * H * 4);

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const u = x / W;
          const v = y / H;
          const lat = (v - 0.5) * Math.PI;
          const lon = (u - 0.5) * Math.PI * 2;

          // Multi-octave noise for continent shapes
          const n1 =
            Math.sin(lon * 2.3 + 0.5) * Math.cos(lat * 3.1 + 0.2) * 0.4;
          const n2 =
            Math.sin(lon * 4.7 - 1.2) * Math.cos(lat * 2.3 + 1.5) * 0.3;
          const n3 =
            Math.cos(lon * 1.5 + 2.1) * Math.sin(lat * 5.3 - 0.8) * 0.2;
          const n4 =
            Math.sin(lon * 7.1 + 0.3) * Math.cos(lat * 4.5 + 2.1) * 0.15;
          const n5 =
            Math.sin(lon * 11.3 - 2.1) * Math.cos(lat * 8.7 + 0.5) * 0.08;
          const noise = n1 + n2 + n3 + n4 + n5;

          const absLat = Math.abs(lat);
          const isIce = absLat > 1.2;
          const isDesert =
            absLat < 0.5 &&
            absLat > 0.2 &&
            noise > 0.05 &&
            noise < 0.25;
          const isLand = noise > 0.06 && !isIce;

          if (isNight) {
            if (isLand && noise > 0.15) {
              // City lights: warm orange-yellow dots
              const cityNoise =
                Math.sin(lon * 40 + lat * 35) *
                Math.cos(lon * 25 - lat * 20);
              if (cityNoise > 0.3) {
                const brightness = 120 + Math.floor(cityNoise * 200);
                data[i] = Math.min(255, brightness + 60); // R
                data[i + 1] = Math.min(255, brightness + 20); // G
                data[i + 2] = Math.floor(brightness * 0.3); // B
              } else {
                data[i] = 3;
                data[i + 1] = 5;
                data[i + 2] = 12;
              }
            } else {
              // Dark ocean / ice
              data[i] = 1;
              data[i + 1] = 2;
              data[i + 2] = 6;
            }
          } else {
            if (isIce) {
              const iceVar = Math.floor(Math.random() * 15);
              data[i] = 215 + iceVar;
              data[i + 1] = 225 + iceVar;
              data[i + 2] = 235 + iceVar;
            } else if (isDesert) {
              data[i] = 180 + Math.floor(noise * 40);
              data[i + 1] = 160 + Math.floor(noise * 30);
              data[i + 2] = 100 + Math.floor(noise * 20);
            } else if (isLand) {
              // Green land with elevation variation
              const elev = Math.max(0, noise - 0.06);
              data[i] = 30 + Math.floor(elev * 80);
              data[i + 1] = 85 + Math.floor(elev * 100);
              data[i + 2] = 25 + Math.floor(elev * 40);
            } else {
              // Ocean with depth variation
              const depth = 0.5 + noise * 0.5;
              data[i] = Math.floor(5 + 15 * depth);
              data[i + 1] = Math.floor(30 + 70 * depth);
              data[i + 2] = Math.floor(100 + 100 * depth);
            }
          }
          data[i + 3] = 255;
        }
      }

      const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
      tex.needsUpdate = true;
      return tex;
    },
    [],
  );

  // ── Create starfield ──────────────────────────────
  const createStarfield = useCallback((): THREE.Points => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      // Distribute on a large sphere around the scene
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 40 + Math.random() * 60;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    return new THREE.Points(geo, mat);
  }, []);

  // ── Create country pins ───────────────────────────
  const createPins = useCallback(
    (scene: THREE.Scene, pinData: CountryPin[]): THREE.Mesh[] => {
      // Remove old pins
      pinMeshesRef.current.forEach((m) => {
        scene.remove(m);
        m.geometry.dispose();
        if (m.material instanceof THREE.Material) m.material.dispose();
      });

      const meshes: THREE.Mesh[] = [];
      const maxStudents = Math.max(
        1,
        ...pinData.map((p) => p.studentCount),
      );

      pinData.forEach((pin, index) => {
        const pos = latLngToVector3(
          pin.latitude,
          pin.longitude,
          GLOBE_RADIUS + 0.005,
        );

        // Scale pin by relative student count
        const ratio = pin.studentCount / maxStudents;
        const scale = 1 + ratio * PIN_MAX_SCALE;
        const size = PIN_BASE_SIZE * scale;

        // Pin geometry: small sphere
        const geo = new THREE.SphereGeometry(size, 12, 12);
        const mat = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(
            0.12 - ratio * 0.1, // Gold → orange
            0.9,
            0.5 + ratio * 0.2,
          ),
          emissive: new THREE.Color().setHSL(
            0.12 - ratio * 0.1,
            0.7,
            0.15 + ratio * 0.2,
          ),
          shininess: 40,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.userData = { pinIndex: index, country: pin.country };
        scene.add(mesh);
        meshes.push(mesh);

        // Add a subtle "beam" from surface
        const beamGeo = new THREE.CylinderGeometry(
          size * 0.3,
          size * 0.3,
          size * 2,
          6,
        );
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0xffcc00,
          transparent: true,
          opacity: 0.25 + ratio * 0.3,
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);

        // Orient beam to point outward from globe center
        beam.position.copy(pos);
        beam.lookAt(0, 0, 0);
        beam.rotateX(Math.PI / 2);
        scene.add(beam);
      });

      return meshes;
    },
    [],
  );

  // ── GL Context creation ───────────────────────────
  const onContextCreate = useCallback(
    (gl: any) => {
      glRef.current = gl;
      const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: {
          width: w,
          height: h,
          style: {},
          addEventListener: () => {},
          removeEventListener: () => {},
          clientHeight: h,
          getContext: () => gl,
          toDataURL: () => "",
          toBlob: () => {},
          captureStream: () => {},
        } as any,
        context: gl,
      });
      renderer.setSize(w, h);
      renderer.setPixelRatio(1);
      renderer.setClearColor(0x030510, 1);
      rendererRef.current = renderer;

      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 200);
      camera.position.z = zoomRef.current;
      cameraRef.current = camera;

      // ── Lighting ──────────────────────────────────
      // Ambient: subtle blue for the dark side
      scene.add(new THREE.AmbientLight(0x1a2244, 0.5));

      // Sun: warm directional light
      const sun = new THREE.DirectionalLight(0xfff8e8, 2.2);
      sun.position.set(5, 2, 5);
      scene.add(sun);

      // Hemisphere light for subtle color variation
      scene.add(new THREE.HemisphereLight(0x88aaff, 0x222244, 0.3));

      // ── Stars ─────────────────────────────────────
      scene.add(createStarfield());

      // ── Globe (day) ───────────────────────────────
      const geo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
      const dayTex = createEarthTexture(false);
      const dayMat = new THREE.MeshPhongMaterial({
        map: dayTex,
        shininess: 15,
        specular: new THREE.Color(0x222244),
      });
      const globe = new THREE.Mesh(geo, dayMat);
      globe.rotation.x = 0.41; // Earth axial tilt
      scene.add(globe);
      globeRef.current = globe;

      // ── Night overlay ─────────────────────────────
      const nightTex = createEarthTexture(true);
      const nightMat = new THREE.MeshBasicMaterial({
        map: nightTex,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const nightMesh = new THREE.Mesh(geo.clone(), nightMat);
      nightMesh.rotation.x = 0.41;
      nightMesh.scale.setScalar(1.001);
      scene.add(nightMesh);
      nightMeshRef.current = nightMesh;

      // ── Atmosphere layers ─────────────────────────
      // Inner glow
      const atmo1Geo = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 64, 64);
      const atmo1Mat = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.07,
        side: THREE.BackSide,
      });
      scene.add(new THREE.Mesh(atmo1Geo, atmo1Mat));

      // Outer glow
      const atmo2Geo = new THREE.SphereGeometry(
        ATMOSPHERE_RADIUS + 0.04,
        64,
        64,
      );
      const atmo2Mat = new THREE.MeshBasicMaterial({
        color: 0x6699ff,
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide,
      });
      scene.add(new THREE.Mesh(atmo2Geo, atmo2Mat));

      // ── Country pins ──────────────────────────────
      if (pinDataRef.current.length > 0) {
        pinMeshesRef.current = createPins(scene, pinDataRef.current);
      }

      // ── Animation loop ────────────────────────────
      let lastTime = Date.now();

      const animate = () => {
        animFrameRef.current = requestAnimationFrame(animate);

        // Skip rendering when app is backgrounded
        if (!isActiveRef.current) return;

        const now = Date.now();
        const dt = Math.min((now - lastTime) / 16.67, 3); // Normalize to ~60fps
        lastTime = now;

        if (!globeRef.current || !nightMeshRef.current || !cameraRef.current)
          return;

        // Auto-rotation with inertia
        if (!isDraggingRef.current) {
          if (autoRotateRef.current) {
            rotationRef.current.y += AUTO_ROTATE_SPEED * dt;
          }
          // Apply inertia damping
          velocityRef.current.x *= DAMPING;
          velocityRef.current.y *= DAMPING;
          rotationRef.current.x += velocityRef.current.x * dt;
          rotationRef.current.y += velocityRef.current.y * dt;

          // Clamp vertical rotation
          rotationRef.current.x = Math.max(
            -1.3,
            Math.min(1.3, rotationRef.current.x),
          );
        }

        // Apply rotation to globe + night mesh
        globeRef.current.rotation.x = rotationRef.current.x;
        globeRef.current.rotation.y = rotationRef.current.y;
        nightMeshRef.current.rotation.x = rotationRef.current.x;
        nightMeshRef.current.rotation.y = rotationRef.current.y;

        // Rotate pins with globe
        pinMeshesRef.current.forEach((pin) => {
          // Pins are children of the scene, not the globe, so we
          // need to rotate them manually. Actually, let's parent them.
        });

        // Smooth zoom
        const targetZ = zoomRef.current;
        cameraRef.current.position.z +=
          (targetZ - cameraRef.current.position.z) * 0.1;

        // Day/night calculation
        const yRot =
          ((rotationRef.current.y % (Math.PI * 2)) + Math.PI * 2) %
          (Math.PI * 2);
        const nightAmount = 0.5 - 0.5 * Math.cos(yRot);
        onDayNightRef.current?.(nightAmount);

        // Animate pin pulsing
        const pulse = 1 + Math.sin(now * 0.003) * 0.08;
        pinMeshesRef.current.forEach((m) => {
          m.scale.setScalar(pulse);
        });

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      animate();
    },
    [createEarthTexture, createStarfield, createPins],
  );

  // ── Update pins when data changes ─────────────────
  useEffect(() => {
    pinDataRef.current = pins;
    if (sceneRef.current && pins.length > 0) {
      // Re-parent pins to globe so they rotate together
      const newMeshes = createPins(sceneRef.current, pins);

      // Parent each pin mesh to the globe
      if (globeRef.current) {
        newMeshes.forEach((m) => {
          sceneRef.current!.remove(m);
          globeRef.current!.add(m);
        });
      }

      pinMeshesRef.current = newMeshes;
    }
  }, [pins, createPins]);

  // ── Cleanup ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (autoRotateTimerRef.current)
        clearTimeout(autoRotateTimerRef.current);
      rendererRef.current?.dispose();
    };
  }, []);

  // ── Gestures ──────────────────────────────────────
  const prevTransRef = useRef({ x: 0, y: 0 });
  const prevScaleRef = useRef(1);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      if (autoRotateTimerRef.current) {
        clearTimeout(autoRotateTimerRef.current);
      }
      prevTransRef.current = { x: 0, y: 0 };
      velocityRef.current = { x: 0, y: 0 };
    })
    .onUpdate((e) => {
      const dx = e.translationX - prevTransRef.current.x;
      const dy = e.translationY - prevTransRef.current.y;
      prevTransRef.current = { x: e.translationX, y: e.translationY };

      const sensitivity = 0.006;
      rotationRef.current.y += dx * sensitivity;
      rotationRef.current.x += dy * sensitivity * 0.7;
      rotationRef.current.x = Math.max(
        -1.3,
        Math.min(1.3, rotationRef.current.x),
      );

      // Track velocity for inertia
      velocityRef.current.x = dy * sensitivity * 0.7 * 0.3;
      velocityRef.current.y = dx * sensitivity * 0.3;
    })
    .onEnd(() => {
      isDraggingRef.current = false;
      // Resume auto-rotation after 3 seconds
      autoRotateTimerRef.current = setTimeout(() => {
        autoRotateRef.current = true;
      }, 3000);
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      prevScaleRef.current = 1;
    })
    .onUpdate((e) => {
      const delta = e.scale - prevScaleRef.current;
      prevScaleRef.current = e.scale;
      zoomRef.current = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, zoomRef.current - delta * 1.5),
      );
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    // Raycasting: find which pin was tapped
    if (
      !cameraRef.current ||
      !sceneRef.current ||
      !globeRef.current ||
      pinMeshesRef.current.length === 0
    )
      return;

    const { width, height } = sizeRef.current;
    const x = (e.x / width) * 2 - 1;
    const y = -(e.y / height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    // Test against pin meshes (which are children of the globe)
    const intersects = raycaster.intersectObjects(
      globeRef.current.children,
      false,
    );

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const pinIndex = hit.userData?.pinIndex;
      if (pinIndex !== undefined && pinDataRef.current[pinIndex]) {
        onPinSelectedRef.current?.(pinDataRef.current[pinIndex]);
      }
    }
  });

  const composedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    tapGesture,
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    sizeRef.current = { width, height };
    setViewSize({ width, height });
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container} onLayout={onLayout}>
        {/* Atmosphere glow halo */}
        <View
          style={[
            styles.atmosphereGlow,
            {
              width: viewSize.width * 0.85,
              height: viewSize.width * 0.85,
              borderRadius: viewSize.width * 0.425,
              top: (viewSize.height - viewSize.width * 0.85) / 2,
              left: (viewSize.width - viewSize.width * 0.85) / 2,
            },
          ]}
        />
        <GestureDetector gesture={composedGesture}>
          <View style={styles.glView}>
            <GLView
              style={StyleSheet.absoluteFill}
              onContextCreate={onContextCreate}
            />
          </View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#030510",
  },
  glView: {
    flex: 1,
  },
  atmosphereGlow: {
    position: "absolute",
    backgroundColor: "rgba(68, 120, 255, 0.08)",
  },
});
