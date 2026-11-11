"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import Aiko from "./Aiko";
import { Mood, Stars, Planets, Constellation, BlackHole } from "./Space";
import { flight } from "@/lib/flight";

export default function Scene({ onReady, lite }: { onReady: () => void; lite: boolean }) {
  return (
    <Canvas
      className="scene"
      dpr={[1, lite ? 1.25 : 1.75]}
      camera={{ position: [0, 0, 10], fov: 30, near: 0.1, far: 120 }}
      gl={{ antialias: !lite, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.setClearColor("#04050b");
      }}
      aria-hidden
    >
      <Mood />
      <Stars count={lite ? 1200 : 2400} />
      <Planets />
      <Constellation />
      <BlackHole />
      <Suspense fallback={null}>
        <Aiko
          onReady={() => {
            flight.on = true;
            onReady();
          }}
        />
        {/* studio reflections, built once, no network */}
        <Environment resolution={128} frames={1}>
          <color attach="background" args={["#05060d"]} />
          <Lightformer form="rect" intensity={5} position={[-4, 4, 4]} scale={[6, 4, 1]} color="#fff3e2" />
          <Lightformer form="rect" intensity={3} position={[5, 1, -4]} scale={[4, 6, 1]} color="#7a5cff" />
          <Lightformer form="rect" intensity={1.4} position={[-5, -2, -4]} scale={[3, 5, 1]} color="#ffb454" />
          <Lightformer form="rect" intensity={1.2} position={[0, 6, -2]} scale={[10, 2, 1]} color="#9fd8ff" />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
