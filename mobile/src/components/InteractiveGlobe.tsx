import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
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
} from "react-native-gesture-handler";
import type { CountryPin } from "@/types/globe";

// ── Constants ───────────────────────────────────────
const GLOBE_RADIUS = 1.0;
const PIN_BASE_SIZE = 0.020;
const PIN_MAX_SCALE = 3.0;
const ATMOSPHERE_RADIUS = 1.065;
const AUTO_ROTATE_SPEED = 0.0008;
const DAMPING = 0.92;
const MIN_ZOOM = 1.8;
const MAX_ZOOM = 5.5;
const DEFAULT_ZOOM = 3.0;
const STAR_COUNT = 2000;

// ── Continent polygon data (lat/lon pairs) ──────────
// Point-in-polygon for accurate continent shapes
const CONTINENTS: Array<[number, number][]> = [
  // North America
  [[-168,72],[-140,72],[-95,72],[-60,75],[-55,50],[-66,44],[-70,41],
   [-75,35],[-80,25],[-90,14],[-84,8],[-83,5],[-77,8],[-80,12],
   [-87,13],[-95,18],[-105,20],[-118,30],[-120,34],[-124,38],
   [-124,50],[-137,58],[-153,58],[-163,65],[-168,72]],
  // South America
  [[-73,12],[-60,12],[-50,5],[-44,-3],[-35,-12],[-35,-22],[-48,-28],
   [-52,-33],[-57,-40],[-63,-44],[-65,-52],[-68,-55],[-65,-55],
   [-65,-45],[-68,-36],[-75,-30],[-77,-18],[-76,-2],[-73,12]],
  // Europe (includes Iberia, Scandinavia, UK approx)
  [[-10,36],[0,36],[10,38],[14,38],[16,37],[22,37],[26,38],[30,40],
   [36,42],[44,44],[50,45],[55,50],[55,55],[48,60],[40,65],[28,70],
   [18,71],[14,69],[5,62],[-3,57],[-8,55],[-10,51],[-8,48],[-10,36]],
  // Africa
  [[-18,15],[-17,22],[-14,33],[-8,37],[10,37],[20,36],[25,34],[32,30],
   [38,22],[42,14],[43,10],[50,12],[43,12],[42,5],[42,0],[40,-8],
   [36,-18],[32,-28],[28,-34],[17,-32],[12,-22],[12,-5],[8,0],
   [2,3],[-2,5],[-5,8],[-14,5],[-18,15]],
  // Asia (large polygon covering Siberia, India, SE Asia)
  [[26,38],[36,36],[44,42],[52,44],[60,50],[68,54],[80,52],[90,55],
   [100,55],[112,54],[120,55],[130,55],[133,48],[138,42],[140,36],
   [138,26],[135,22],[125,18],[120,12],[108,5],[104,2],[100,2],[96,0],
   [98,5],[100,20],[97,26],[90,22],[88,22],[84,20],[78,14],[72,18],
   [68,22],[62,22],[58,24],[56,26],[60,36],[52,38],[44,42],[36,36],[26,38]],
  // Australia
  [[114,-22],[120,-18],[128,-14],[134,-12],[140,-14],[144,-16],[150,-22],
   [153,-26],[152,-30],[151,-34],[148,-38],[144,-39],[138,-35],[130,-35],
   [126,-34],[122,-33],[118,-32],[114,-28],[114,-22]],
  // Greenland
  [[-50,60],[-44,60],[-38,64],[-26,68],[-18,72],[-18,76],[-25,80],
   [-38,83],[-48,83],[-58,80],[-62,78],[-65,74],[-68,72],[-65,68],
   [-58,66],[-50,60]],
  // UK / British Isles (approximate)
  [[-5,50],[-3,50],[0,51],[2,52],[0,54],[-2,55],[-4,56],[-6,57],
   [-8,58],[-8,56],[-6,54],[-5,52],[-5,50]],
  // Japan (simplified)
  [[130,31],[132,34],[134,36],[136,38],[138,40],[140,42],[142,44],
   [143,40],[141,38],[139,36],[137,34],[134,32],[131,30],[130,31]],
  // New Zealand (approximate)
  [[166,-46],[168,-44],[170,-42],[172,-40],[174,-38],[175,-36],
   [174,-34],[172,-36],[170,-38],[168,-40],[166,-44],[166,-46]],
  // Madagascar
  [[44,-12],[48,-12],[50,-16],[50,-20],[48,-24],[44,-26],[42,-22],
   [44,-18],[44,-14],[44,-12]],
  // Sri Lanka
  [[80,8],[82,8],[82,6],[80,6],[80,8]],
];

function pointInPolygon(lon: number, lat: number, poly: [number, number][]): boolean {
  let inside = false;
  const n = poly.length;
  let j = n - 1;
  for (let i = 0; i < n; i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
    j = i;
  }
  return inside;
}

function isLandPixel(lon: number, lat: number): boolean {
  for (const poly of CONTINENTS) {
    if (pointInPolygon(lon, lat, poly)) return true;
  }
  return false;
}

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
  // Europe – core Erasmus
  Spain: "🇪🇸", Italy: "🇮🇹", France: "🇫🇷", Germany: "🇩🇪",
  Portugal: "🇵🇹", Netherlands: "🇳🇱", Poland: "🇵🇱", "Czech Republic": "🇨🇿",
  Austria: "🇦🇹", Denmark: "🇩🇰", Belgium: "🇧🇪", Finland: "🇫🇮",
  Ireland: "🇮🇪", Sweden: "🇸🇪", Greece: "🇬🇷", Romania: "🇷🇴",
  Hungary: "🇭🇺", Croatia: "🇭🇷", Norway: "🇳🇴", Slovakia: "🇸🇰",
  Slovenia: "🇸🇮", Bulgaria: "🇧🇬", Latvia: "🇱🇻", Lithuania: "🇱🇹",
  Estonia: "🇪🇪", Malta: "🇲🇹", Cyprus: "🇨🇾", Switzerland: "🇨🇭",
  Turkey: "🇹🇷", Serbia: "🇷🇸", Iceland: "🇮🇸", Ukraine: "🇺🇦",
  Moldova: "🇲🇩",
  // Middle East & North Africa
  Morocco: "🇲🇦", Tunisia: "🇹🇳", Egypt: "🇪🇬", Jordan: "🇯🇴",
  Lebanon: "🇱🇧", Israel: "🇮🇱",
  // Sub-Saharan Africa
  "South Africa": "🇿🇦", Kenya: "🇰🇪", Senegal: "🇸🇳", Ghana: "🇬🇭",
  Ethiopia: "🇪🇹", Cameroon: "🇨🇲",
  // Americas
  Mexico: "🇲🇽", Brazil: "🇧🇷", Argentina: "🇦🇷", Colombia: "🇨🇴",
  Chile: "🇨🇱", Peru: "🇵🇪", Ecuador: "🇪🇨",
  "United States": "🇺🇸", Canada: "🇨🇦",
  // Asia-Pacific
  Japan: "🇯🇵", "South Korea": "🇰🇷", China: "🇨🇳", India: "🇮🇳",
  Australia: "🇦🇺", "New Zealand": "🇳🇿", Thailand: "🇹🇭",
  Malaysia: "🇲🇾", Singapore: "🇸🇬", Vietnam: "🇻🇳", Indonesia: "🇮🇩",
  // Ex-Soviet / Caucasus / Central Asia
  Georgia: "🇬🇪", Armenia: "🇦🇲", Kazakhstan: "🇰🇿", Uzbekistan: "🇺🇿",
};

export { COUNTRY_FLAGS };

// ── Ref API ─────────────────────────────────────────

export interface InteractiveGlobeRef {
  /** Smoothly fly to a lat/lon coordinate */
  flyTo: (lat: number, lng: number) => void;
  /** Reset rotation and zoom to default */
  resetView: () => void;
  /** Enable or disable auto-rotation */
  setAutoRotate: (enabled: boolean) => void;
  /** Enable or disable night mode overlay */
  setNightMode: (enabled: boolean) => void;
}

// ── Props ───────────────────────────────────────────

interface InteractiveGlobeProps {
  pins: CountryPin[];
  selectedCountry?: CountryPin | null;
  onPinSelected?: (pin: CountryPin) => void;
  onDayNightChange?: (nightAmount: number) => void;
  nightMode?: boolean;
}

/**
 * Interactive 3D Earth globe with:
 * - Accurate continent shapes (polygon-based land mask)
 * - Realistic ocean depth, deserts, ice caps, city lights
 * - Starfield background with varied star sizes
 * - Multi-layer atmospheric glow
 * - Sun lighting with specular ocean
 * - Pan / pinch / tap gestures with inertia
 * - Country pins sized by student density
 * - Selected country pin highlight
 * - Imperative API via forwardRef
 */
const InteractiveGlobe = forwardRef<InteractiveGlobeRef, InteractiveGlobeProps>(
function InteractiveGlobeInner({
  pins,
  selectedCountry,
  onPinSelected,
  onDayNightChange,
  nightMode = false,
}: InteractiveGlobeProps, ref) {
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
  const rotationRef = useRef({ x: 0.3, y: 0 });
  const targetRotationRef = useRef({ x: 0.3, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const autoRotateRef = useRef(true);
  const autoRotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nightModeRef = useRef(nightMode);

  // Zoom state
  const zoomRef = useRef(DEFAULT_ZOOM);

  // Callbacks
  const onPinSelectedRef = useRef(onPinSelected);
  const onDayNightRef = useRef(onDayNightChange);
  const selectedCountryRef = useRef(selectedCountry);

  const [viewSize, setViewSize] = useState({ width: 300, height: 300 });

  useEffect(() => { onPinSelectedRef.current = onPinSelected; }, [onPinSelected]);
  useEffect(() => { onDayNightRef.current = onDayNightChange; }, [onDayNightChange]);
  useEffect(() => { selectedCountryRef.current = selectedCountry; }, [selectedCountry]);
  useEffect(() => { nightModeRef.current = nightMode; }, [nightMode]);

  // ── Imperative API ────────────────────────────────
  useImperativeHandle(ref, () => ({
    flyTo: (lat: number, lng: number) => {
      // Convert lat/lon to target rotation angles
      const targetY = -((lng + 180) * Math.PI) / 180 + Math.PI;
      const targetX = (-lat * Math.PI) / 180;
      targetRotationRef.current = {
        x: Math.max(-1.3, Math.min(1.3, targetX)),
        y: targetY,
      };
      autoRotateRef.current = false;
      velocityRef.current = { x: 0, y: 0 };
    },
    resetView: () => {
      targetRotationRef.current = { x: 0.3, y: 0 };
      zoomRef.current = DEFAULT_ZOOM;
      autoRotateRef.current = true;
    },
    setAutoRotate: (enabled: boolean) => {
      autoRotateRef.current = enabled;
    },
    setNightMode: (enabled: boolean) => {
      nightModeRef.current = enabled;
    },
  }), []);

  // ── AppState listener ──────────────────────────────
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      isActiveRef.current = state === "active";
    };
    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, []);

  // ── Realistic Earth texture (polygon-based continents) ──
  const createEarthTexture = useCallback(
    (isNight: boolean): THREE.DataTexture => {
      // Use 512x256 for good quality with acceptable performance
      const W = 512;
      const H = 256;
      const data = new Uint8Array(W * H * 4);

      // Pre-seed a simple pseudo-random function for consistent noise
      const hash = (n: number) => {
        const x = Math.sin(n * 127.1) * 43758.5453;
        return x - Math.floor(x);
      };

      // City light hotspots: [lon, lat, intensity] for realistic night lights
      const CITY_CLUSTERS = [
        // Europe
        [2,48,0.9], [13,52,0.85], [0,51,0.9], [4,52,0.8], [12,46,0.75],
        [18,50,0.7], [25,44,0.65], [30,60,0.7], [24,60,0.65], [22,48,0.7],
        [14,50,0.8], [10,53,0.75], [16,48,0.75], [2,41,0.8], [-4,40,0.75],
        [-8,39,0.7], [3,37,0.65], [12,42,0.75],
        // North America
        [-74,40,0.95], [-87,41,0.9], [-118,34,0.9], [-122,37,0.85],
        [-80,25,0.8], [-95,29,0.8], [-77,38,0.85], [-71,42,0.85],
        [-90,29,0.75], [-83,42,0.8], [-104,39,0.7], [-122,47,0.75],
        [-79,43,0.75], [-73,45,0.7],
        // East Asia
        [121,31,0.95], [116,39,0.95], [139,35,0.95], [127,37,0.9],
        [126,37,0.85], [103,22,0.85], [103,1,0.8], [100,13,0.8],
        [106,10,0.75], [114,22,0.9], [120,26,0.85],
        // South/SE Asia
        [72,19,0.85], [77,12,0.8], [77,28,0.85], [88,22,0.8],
        [90,23,0.8], [67,24,0.8],
        // South America
        [-46,-23,0.85], [-43,-22,0.8], [-58,-34,0.75], [-77,-12,0.65],
        [-68,-25,0.6], [-70,-33,0.7],
        // Africa
        [28,-26,0.7], [36,0,0.65], [32,30,0.7], [3,6,0.6],
        // Middle East
        [51,25,0.75], [55,25,0.7], [46,24,0.75], [36,33,0.7],
        [39,21,0.7], [44,33,0.65],
      ] as [number, number, number][];

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const lonDeg = (x / W) * 360 - 180;
          const latDeg = 90 - (y / H) * 180;

          // Determine if this pixel is land using polygon test
          const land = isLandPixel(lonDeg, latDeg);

          // Noise for fine detail (coastlines, terrain)
          const lon = (lonDeg * Math.PI) / 180;
          const lat = (latDeg * Math.PI) / 180;
          const noiseDetail =
            Math.sin(lon * 12.1 + 0.5) * Math.cos(lat * 8.3 + 0.2) * 0.5 +
            Math.sin(lon * 23.7 - 1.2) * Math.cos(lat * 14.5 + 1.5) * 0.3 +
            Math.sin(lon * 41.3 + 2.1) * Math.cos(lat * 27.9 - 0.8) * 0.2;
          // Use noise only near coastlines (±8° in lat/lon), pure polygon for interior
          const coastNoise = noiseDetail * 0.15;

          const absLat = Math.abs(latDeg);
          const isPolarIce = absLat > 72;
          const isArctic = absLat > 65 && land;

          // Desert regions: Sahara, Arabian, Australian outback
          const isSahara = latDeg > 14 && latDeg < 34 && lonDeg > -18 && lonDeg < 55 && land;
          const isArabian = latDeg > 14 && latDeg < 28 && lonDeg > 35 && lonDeg < 58 && land;
          const isGobi = latDeg > 38 && latDeg < 48 && lonDeg > 85 && lonDeg < 120 && land;
          const isAustralia = latDeg > -35 && latDeg < -18 && lonDeg > 118 && lonDeg < 148 && land;
          const isDesert = isSahara || isArabian || isGobi || isAustralia;

          // Rainforest (Amazon, Congo)
          const isAmazon = latDeg > -10 && latDeg < 5 && lonDeg > -75 && lonDeg < -50 && land;
          const isCongo = latDeg > -5 && latDeg < 5 && lonDeg > 14 && lonDeg < 30 && land;
          const isRainforest = isAmazon || isCongo;

          if (isNight) {
            // Dark base for everything
            data[i] = 1; data[i+1] = 2; data[i+2] = 8;

            if (isPolarIce) {
              // Faint ice reflection
              data[i] = 8; data[i+1] = 10; data[i+2] = 20;
            } else if (land) {
              // Scatter city lights across land based on hotspot proximity
              let lightIntensity = 0;
              const lonDegR = lonDeg;
              const latDegR = latDeg;
              for (const [cx, cy, ci] of CITY_CLUSTERS) {
                const dx = lonDegR - cx;
                const dy = latDegR - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 8) {
                  lightIntensity = Math.max(lightIntensity, ci * Math.exp(-dist * dist / 12));
                }
              }
              // Add scattered smaller lights
              const scatterSeed = hash(x * 7919 + y * 3571);
              const scatter = scatterSeed > 0.96 ? scatterSeed * 0.4 : 0;
              const totalLight = Math.min(1, lightIntensity + scatter);

              if (totalLight > 0.05) {
                // Warm orange-yellow city lights
                data[i] = Math.min(255, Math.floor(totalLight * 200 + 40));
                data[i+1] = Math.min(255, Math.floor(totalLight * 150 + 20));
                data[i+2] = Math.floor(totalLight * 40 + 5);
              } else {
                data[i] = 2; data[i+1] = 3; data[i+2] = 10;
              }
            }
          } else {
            if (isPolarIce) {
              const iceV = 210 + Math.floor(hash(x * 31 + y * 17) * 35);
              data[i] = iceV; data[i+1] = iceV + 8; data[i+2] = Math.min(255, iceV + 18);
            } else if (!land) {
              // Realistic ocean: deep blue to teal
              const depthFactor = 0.3 + 0.7 * (Math.sin(lon * 3.1 + 0.5) * 0.5 + 0.5);
              const waveShimmer = Math.sin(lon * 20 + lat * 15) * 0.03;
              const d = Math.max(0, Math.min(1, depthFactor + waveShimmer));
              data[i]   = Math.floor(8  + d * 22 + coastNoise * 10);
              data[i+1] = Math.floor(40 + d * 60 + coastNoise * 15);
              data[i+2] = Math.floor(110 + d * 80 + coastNoise * 20);
            } else if (isArctic) {
              // Tundra / permafrost
              const v = 120 + Math.floor(hash(x * 13 + y * 7) * 40);
              data[i] = v + 30; data[i+1] = v + 20; data[i+2] = v;
            } else if (isDesert) {
              // Sand/rock colors
              const s = 0.4 + hash(x * 53 + y * 29) * 0.5;
              data[i]   = Math.min(255, Math.floor(165 + s * 65));
              data[i+1] = Math.floor(128 + s * 50);
              data[i+2] = Math.floor(55 + s * 30);
            } else if (isRainforest) {
              // Deep green rainforest
              const s = 0.3 + hash(x * 41 + y * 23) * 0.6;
              data[i]   = Math.floor(15 + s * 25);
              data[i+1] = Math.floor(70 + s * 60);
              data[i+2] = Math.floor(20 + s * 15);
            } else {
              // General land: varied greens/browns based on elevation simulation
              const elev = 0.3 + hash(x * 71 + y * 43) * 0.7 + coastNoise * 0.3;
              const isMountain = elev > 0.85;
              if (isMountain) {
                // Rocky mountains: grey-brown
                const m = Math.floor(100 + elev * 80);
                data[i] = m - 10; data[i+1] = m - 15; data[i+2] = m - 20;
              } else {
                // Grassland / forest
                const g = 0.4 + elev * 0.5;
                data[i]   = Math.floor(35 + g * 55);
                data[i+1] = Math.floor(75 + g * 75);
                data[i+2] = Math.floor(20 + g * 25);
              }
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
    const colors = new Float32Array(STAR_COUNT * 3);

    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 50 + Math.random() * 50;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Slightly varied star colors: white, blue-white, yellow-white
      const temp = Math.random();
      if (temp > 0.85) { colors[i*3]=0.7; colors[i*3+1]=0.8; colors[i*3+2]=1.0; }       // blue
      else if (temp > 0.7) { colors[i*3]=1.0; colors[i*3+1]=0.95; colors[i*3+2]=0.8; }  // warm
      else { colors[i*3]=1.0; colors[i*3+1]=1.0; colors[i*3+2]=1.0; }                   // white
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.12,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
    });

    return new THREE.Points(geo, mat);
  }, []);

  // ── Create country pins ───────────────────────────
  const createPins = useCallback(
    (scene: THREE.Scene, pinData: CountryPin[], selected?: CountryPin | null): THREE.Mesh[] => {
      // Remove old pins
      pinMeshesRef.current.forEach((m) => {
        if (m.parent) m.parent.remove(m);
        m.geometry.dispose();
        if (m.material instanceof THREE.Material) m.material.dispose();
      });
      pinMeshesRef.current = [];

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

        // Add a subtle "beam" / ring for selected country
        const isSelected = selected && selected.country === pin.country;
        if (isSelected) {
          // Ring glow around selected pin
          const ringGeo = new THREE.RingGeometry(size * 1.8, size * 2.4, 24);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.copy(pos);
          ring.lookAt(0, 0, 0);
          scene.add(ring);
          meshes.push(ring);
        }

        // Vertical beam
        const beamGeo = new THREE.CylinderGeometry(
          size * 0.25,
          size * 0.25,
          isSelected ? size * 4 : size * 2,
          6,
        );
        const beamColor = isSelected ? 0xffffff : 0xffcc00;
        const beamMat = new THREE.MeshBasicMaterial({
          color: beamColor,
          transparent: true,
          opacity: isSelected ? 0.8 : 0.2 + ratio * 0.3,
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.copy(pos);
        beam.lookAt(0, 0, 0);
        beam.rotateX(Math.PI / 2);
        scene.add(beam);
        meshes.push(beam);
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
          style: { touchAction: "none" },
          addEventListener: () => {},
          removeEventListener: () => {},
          clientWidth: w,
          clientHeight: h,
          getContext: () => gl,
          toDataURL: () => "",
          toBlob: () => {},
          captureStream: () => {},
          ownerDocument: { createElementNS: () => ({}) },
        } as any,
        context: gl,
        antialias: false,
        alpha: false,
        powerPreference: "default",
      });
      renderer.setSize(w, h);
      renderer.setPixelRatio(1);
      renderer.setClearColor(0x030510, 1);
      renderer.autoClear = true;
      rendererRef.current = renderer;

      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 200);
      camera.position.z = zoomRef.current;
      cameraRef.current = camera;

      // ── Lighting ──────────────────────────────────
      scene.add(new THREE.AmbientLight(0x1a2855, 0.6));

      const sun = new THREE.DirectionalLight(0xfff6e0, 2.5);
      sun.position.set(6, 2, 4);
      scene.add(sun);

      // Fill light from opposite side (moonlight simulation)
      const moon = new THREE.DirectionalLight(0x334466, 0.3);
      moon.position.set(-6, -2, -4);
      scene.add(moon);

      scene.add(new THREE.HemisphereLight(0x6688cc, 0x112233, 0.4));

      // ── Stars ─────────────────────────────────────
      scene.add(createStarfield());

      // ── Globe (day) ───────────────────────────────
      const geo = new THREE.SphereGeometry(GLOBE_RADIUS, 80, 80);
      const dayTex = createEarthTexture(false);
      const dayMat = new THREE.MeshPhongMaterial({
        map: dayTex,
        shininess: 20,
        specular: new THREE.Color(0x112244),
      });
      const globe = new THREE.Mesh(geo, dayMat);
      globe.rotation.x = 0.41;
      scene.add(globe);
      globeRef.current = globe;

      // ── Night overlay ─────────────────────────────
      const nightTex = createEarthTexture(true);
      const nightMat = new THREE.MeshBasicMaterial({
        map: nightTex,
        transparent: true,
        opacity: nightModeRef.current ? 0.95 : 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const nightMesh = new THREE.Mesh(geo.clone(), nightMat);
      nightMesh.rotation.x = 0.41;
      nightMesh.scale.setScalar(1.001);
      scene.add(nightMesh);
      nightMeshRef.current = nightMesh;

      // ── Atmosphere layers ─────────────────────────
      const atmo1Geo = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 64, 64);
      const atmo1Mat = new THREE.MeshBasicMaterial({
        color: 0x3377ff,
        transparent: true,
        opacity: 0.09,
        side: THREE.BackSide,
      });
      scene.add(new THREE.Mesh(atmo1Geo, atmo1Mat));

      const atmo2Geo = new THREE.SphereGeometry(ATMOSPHERE_RADIUS + 0.05, 64, 64);
      const atmo2Mat = new THREE.MeshBasicMaterial({
        color: 0x5599ff,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide,
      });
      scene.add(new THREE.Mesh(atmo2Geo, atmo2Mat));

      // Outermost haze
      const atmo3Geo = new THREE.SphereGeometry(ATMOSPHERE_RADIUS + 0.12, 64, 64);
      const atmo3Mat = new THREE.MeshBasicMaterial({
        color: 0x4488ee,
        transparent: true,
        opacity: 0.025,
        side: THREE.BackSide,
      });
      scene.add(new THREE.Mesh(atmo3Geo, atmo3Mat));

      // ── Country pins ──────────────────────────────
      if (pinDataRef.current.length > 0) {
        const initialMeshes = createPins(scene, pinDataRef.current, selectedCountryRef.current);
        initialMeshes.forEach((m) => { scene.remove(m); globe.add(m); });
        pinMeshesRef.current = initialMeshes;
      }

      // ── Animation loop ────────────────────────────
      let lastTime = Date.now();

      const animate = () => {
        animFrameRef.current = requestAnimationFrame(animate);
        if (!isActiveRef.current) return;

        const now = Date.now();
        const dt = Math.min((now - lastTime) / 16.67, 3);
        lastTime = now;

        if (!globeRef.current || !nightMeshRef.current || !cameraRef.current)
          return;

        // Auto-rotation with inertia
        if (!isDraggingRef.current) {
          if (autoRotateRef.current) {
            rotationRef.current.y += AUTO_ROTATE_SPEED * dt;
            targetRotationRef.current.y = rotationRef.current.y;
          }
          velocityRef.current.x *= DAMPING;
          velocityRef.current.y *= DAMPING;
          rotationRef.current.x += velocityRef.current.x * dt;
          rotationRef.current.y += velocityRef.current.y * dt;
          rotationRef.current.x = Math.max(-1.3, Math.min(1.3, rotationRef.current.x));
        }

        // Apply rotation to globe + night mesh
        // Smooth flyTo: interpolate toward target rotation
        const tR = targetRotationRef.current;
        const dxRot = tR.x - rotationRef.current.x;
        const dyRot = tR.y - rotationRef.current.y;
        const flySpeed = 0.08 * dt;
        if (Math.abs(dxRot) > 0.001 || Math.abs(dyRot) > 0.001) {
          rotationRef.current.x += dxRot * flySpeed;
          rotationRef.current.y += dyRot * flySpeed;
        }

        globeRef.current.rotation.x = rotationRef.current.x;
        globeRef.current.rotation.y = rotationRef.current.y;
        nightMeshRef.current.rotation.x = rotationRef.current.x;
        nightMeshRef.current.rotation.y = rotationRef.current.y;

        // Smooth zoom
        const targetZ = zoomRef.current;
        cameraRef.current.position.z +=
          (targetZ - cameraRef.current.position.z) * 0.1;

        // Night mode: smoothly blend night overlay opacity
        const nm = nightMeshRef.current.material as THREE.MeshBasicMaterial;
        const nightTarget = nightModeRef.current ? 0.95 : 0.0;
        nm.opacity += (nightTarget - nm.opacity) * 0.05;

        // Day/night calculation for background
        const yRot =
          ((rotationRef.current.y % (Math.PI * 2)) + Math.PI * 2) %
          (Math.PI * 2);
        const nightAmount = 0.5 - 0.5 * Math.cos(yRot);
        onDayNightRef.current?.(nightModeRef.current ? 1 : nightAmount);

        // Pin pulse animation (gentle)
        const pulse = 1 + Math.sin(now * 0.0025) * 0.06;
        pinMeshesRef.current.forEach((m) => {
          if (m.userData?.pinIndex !== undefined) {
            m.scale.setScalar(pulse);
          }
        });

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      animate();
    },
    [createEarthTexture, createStarfield, createPins],
  );

  // ── Update pins when data or selection changes ────
  useEffect(() => {
    pinDataRef.current = pins;
    if (sceneRef.current && globeRef.current && pins.length > 0) {
      const newMeshes = createPins(sceneRef.current, pins, selectedCountryRef.current);
      newMeshes.forEach((m) => {
        sceneRef.current!.remove(m);
        globeRef.current!.add(m);
      });
      pinMeshesRef.current = newMeshes;
    }
  }, [pins, selectedCountry, createPins]);

  // ── Cleanup ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
      rendererRef.current?.dispose();
    };
  }, []);

  // ── Gestures ──────────────────────────────────────
  const prevTransRef = useRef({ x: 0, y: 0 });
  const prevScaleRef = useRef(1);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
      prevTransRef.current = { x: 0, y: 0 };
      velocityRef.current = { x: 0, y: 0 };
    })
    .onUpdate((e) => {
      const dx = e.translationX - prevTransRef.current.x;
      const dy = e.translationY - prevTransRef.current.y;
      prevTransRef.current = { x: e.translationX, y: e.translationY };

      const sensitivity = 0.005;
      rotationRef.current.y += dx * sensitivity;
      rotationRef.current.x += dy * sensitivity * 0.7;
      rotationRef.current.x = Math.max(-1.3, Math.min(1.3, rotationRef.current.x));
      // Sync target so flyTo doesn't fight the drag
      targetRotationRef.current = { ...rotationRef.current };

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
    .runOnJS(true)
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

  const tapGesture = Gesture.Tap().runOnJS(true).onEnd((e) => {
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
    <View style={styles.root}>
      <View style={styles.container} onLayout={onLayout}>
        {/* Outer atmosphere halo */}
        <View
          style={[
            styles.atmosphereGlow,
            {
              width: viewSize.width * 0.88,
              height: viewSize.width * 0.88,
              borderRadius: viewSize.width * 0.44,
              top: (viewSize.height - viewSize.width * 0.88) / 2,
              left: (viewSize.width - viewSize.width * 0.88) / 2,
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
    </View>
  );
});

export default InteractiveGlobe;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#020408",
  },
  glView: {
    flex: 1,
  },
  atmosphereGlow: {
    position: "absolute",
    backgroundColor: "rgba(50, 100, 255, 0.10)",
    shadowColor: "#4488ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 0,
  },
});
