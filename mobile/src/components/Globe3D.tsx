import React, { useRef, useEffect, useCallback } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { GLView } from "expo-gl";
import * as THREE from "three";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

interface Globe3DProps {
  size?: number;
  onRotationChange?: (normalizedX: number) => void;
}

export default function Globe3D({
  size = 200,
  onRotationChange,
}: Globe3DProps): React.JSX.Element {
  const glRef = useRef<any>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number>(0);
  const rotationRef = useRef({ x: 0.3, y: 0 });
  const autoRotateRef = useRef(true);
  const isDraggingRef = useRef(false);

  // Shared values for gesture-driven glow
  const rotYShared = useSharedValue(0);

  const createGlobeTexture = useCallback((): THREE.Texture => {
    // Create procedural earth texture using canvas-like approach
    const textureSize = 512;
    const data = new Uint8Array(textureSize * textureSize * 4);

    for (let y = 0; y < textureSize; y++) {
      for (let x = 0; x < textureSize; x++) {
        const i = (y * textureSize + x) * 4;

        // Convert to spherical coordinates for realistic look
        const u = x / textureSize;
        const v = y / textureSize;
        const lat = (v - 0.5) * Math.PI;
        const lon = (u - 0.5) * Math.PI * 2;

        // Generate simplified continent shapes using noise-like functions
        const n1 =
          Math.sin(lon * 2.3 + 0.5) * Math.cos(lat * 3.1 + 0.2) * 0.4;
        const n2 =
          Math.sin(lon * 4.7 - 1.2) * Math.cos(lat * 2.3 + 1.5) * 0.3;
        const n3 =
          Math.cos(lon * 1.5 + 2.1) * Math.sin(lat * 5.3 - 0.8) * 0.2;
        const n4 =
          Math.sin(lon * 7.1 + 0.3) * Math.cos(lat * 4.5 + 2.1) * 0.1;
        const noise = n1 + n2 + n3 + n4;

        // Ice caps
        const isIceCap = Math.abs(lat) > 1.25;

        // Land threshold
        const isLand = noise > 0.08 && !isIceCap;

        // Mountain regions
        const isMountain = noise > 0.35 && !isIceCap;

        if (isIceCap) {
          // White ice caps
          data[i] = 220;
          data[i + 1] = 230;
          data[i + 2] = 240;
        } else if (isMountain) {
          // Brown/darker green mountains
          data[i] = 80 + Math.floor(noise * 40);
          data[i + 1] = 100 + Math.floor(noise * 30);
          data[i + 2] = 50;
        } else if (isLand) {
          // Green land with variation
          const green = 120 + Math.floor(noise * 80);
          data[i] = 40 + Math.floor(noise * 30);
          data[i + 1] = green;
          data[i + 2] = 35 + Math.floor(noise * 25);
        } else {
          // Ocean with depth variation
          const depth = 0.5 + noise * 0.3;
          data[i] = Math.floor(15 * depth);
          data[i + 1] = Math.floor(50 + 80 * depth);
          data[i + 2] = Math.floor(130 + 80 * depth);
        }
        data[i + 3] = 255;
      }
    }

    const texture = new THREE.DataTexture(
      data,
      textureSize,
      textureSize,
      THREE.RGBAFormat,
    );
    texture.needsUpdate = true;
    return texture;
  }, []);

  const onContextCreate = useCallback(
    (gl: any) => {
      glRef.current = gl;

      const renderer = new THREE.WebGLRenderer({
        canvas: {
          width: gl.drawingBufferWidth,
          height: gl.drawingBufferHeight,
          style: {},
          addEventListener: () => {},
          removeEventListener: () => {},
          clientHeight: gl.drawingBufferHeight,
          getContext: () => gl,
          toDataURL: () => "",
          toBlob: () => {},
          captureStream: () => {},
        } as any,
        context: gl,
      });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setPixelRatio(1);
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;

      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        45,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000,
      );
      camera.position.z = 3.5;
      cameraRef.current = camera;

      // Lights
      const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffeedd, 1.8);
      sunLight.position.set(5, 2, 5);
      scene.add(sunLight);

      // Subtle blue rim light (atmosphere effect)
      const rimLight = new THREE.DirectionalLight(0x4488ff, 0.4);
      rimLight.position.set(-3, 0, -2);
      scene.add(rimLight);

      // Globe
      const geometry = new THREE.SphereGeometry(1.2, 64, 64);
      const texture = createGlobeTexture();
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 15,
        specular: new THREE.Color(0x222244),
      });
      const globe = new THREE.Mesh(geometry, material);
      globe.rotation.x = 0.3; // Slight tilt like Earth
      scene.add(globe);
      globeRef.current = globe;

      // Atmosphere glow ring
      const atmosphereGeometry = new THREE.SphereGeometry(1.25, 64, 64);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x3388ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
      });
      const atmosphere = new THREE.Mesh(
        atmosphereGeometry,
        atmosphereMaterial,
      );
      scene.add(atmosphere);

      // Animation loop
      const animate = () => {
        animFrameRef.current = requestAnimationFrame(animate);

        if (globeRef.current) {
          if (autoRotateRef.current && !isDraggingRef.current) {
            rotationRef.current.y += 0.003;
          }
          globeRef.current.rotation.x = rotationRef.current.x;
          globeRef.current.rotation.y = rotationRef.current.y;

          // Update shared value for background effect
          const normalizedRotation =
            ((rotationRef.current.y % (Math.PI * 2)) + Math.PI * 2) %
            (Math.PI * 2);
          rotYShared.value = normalizedRotation / (Math.PI * 2);
        }

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      animate();
    },
    [createGlobeTexture, rotYShared],
  );

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const prevTransRef = useRef({ x: 0, y: 0 });

  // Pan gesture for interactive rotation
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      prevTransRef.current = { x: 0, y: 0 };
    })
    .onUpdate((event) => {
      if (globeRef.current) {
        const dx = event.translationX - prevTransRef.current.x;
        const dy = event.translationY - prevTransRef.current.y;
        prevTransRef.current = {
          x: event.translationX,
          y: event.translationY,
        };
        rotationRef.current.y += dx * 0.008;
        rotationRef.current.x += dy * 0.005;
        // Clamp vertical rotation
        rotationRef.current.x = Math.max(
          -1.0,
          Math.min(1.0, rotationRef.current.x),
        );
      }
    })
    .onEnd(() => {
      isDraggingRef.current = false;
      // Resume auto-rotation after a delay
      setTimeout(() => {
        autoRotateRef.current = true;
      }, 2000);
    });

  // Background ambient glow animated style based on rotation
  const glowStyle = useAnimatedStyle(() => {
    const warmth = interpolate(
      rotYShared.value,
      [0, 0.25, 0.5, 0.75, 1],
      [0.3, 0.6, 0.3, 0.1, 0.3],
      Extrapolation.CLAMP,
    );
    return {
      opacity: withTiming(0.15 + warmth * 0.25, { duration: 300 }),
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Ambient glow behind globe */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
          },
          glowStyle,
        ]}
      />

      {/* Atmosphere ring */}
      <View
        style={[
          styles.atmosphereRing,
          {
            width: size * 1.12,
            height: size * 1.12,
            borderRadius: size * 0.56,
          },
        ]}
      />

      <GestureDetector gesture={panGesture}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: "hidden",
          }}
        >
          <GLView
            style={{ width: size, height: size }}
            onContextCreate={onContextCreate}
          />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    backgroundColor: "rgba(51, 136, 255, 0.3)",
  },
  atmosphereRing: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(100, 200, 255, 0.15)",
  },
});
