"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { flight, wide, narrow, smooth, type Gesture, type Pose } from "@/lib/flight";

const MODEL = "/models/aiko.glb";
useGLTF.preload(MODEL);

// Hand targets in Aiko's local space, [x, y, z] for her screen-right (L) and screen-left (R) hand.
const REST = { L: [0.78, -0.02, 0.12], R: [-0.78, -0.02, 0.12] } as const;
const HANDS: Record<Gesture, { L: readonly number[]; R: readonly number[]; wave?: "L" | "R" }> = {
  idle: REST,
  wave: { L: REST.L, R: [-0.92, 0.95, 0.25], wave: "R" },
  pointR: { L: [1.08, 0.42, 0.42], R: REST.R },
  pointL: { L: REST.L, R: [-1.08, 0.42, 0.42] },
  present: { L: [0.98, 0.3, 0.42], R: [-0.98, 0.3, 0.42] },
  up: { L: [0.72, 1.25, 0.3], R: REST.R },
  think: { L: REST.L, R: [-0.36, 0.5, 0.62] },
  cover: { L: [0.21, 1.36, 0.74], R: [-0.21, 1.36, 0.74] },
};

const faceMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uLook: { value: new THREE.Vector2() },
      uBlink: { value: 0 },
      uHappy: { value: 0 },
      uWow: { value: 0 },
      uTalk: { value: 0 },
      uColor: { value: new THREE.Color("#ff6a52") },
    },
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vPos;
      uniform float uTime, uBlink, uHappy, uWow, uTalk;
      uniform vec2 uLook;
      uniform vec3 uColor;

      float ellipse(vec2 p, vec2 c, vec2 r) {
        vec2 q = (p - c) / r;
        return 1.0 - smoothstep(0.82, 1.0, dot(q, q));
      }

      float faceMask(vec2 p) {
        vec2 look = uLook * vec2(0.05, 0.035);
        float open = mix(1.0, 0.08, uBlink);
        vec2 r = vec2(0.07 + 0.012 * uWow, (0.115 + 0.02 * uWow) * open);
        float eyes = 0.0;
        for (int i = 0; i < 2; i++) {
          vec2 c = vec2(i == 0 ? -0.2 : 0.2, 0.0) + look;
          float e = ellipse(p, c, r);
          // happy: an upward arc, like a closed smiling eye
          float arc = ellipse(p, c + vec2(0.0, -0.02), vec2(0.095, 0.1)) * (1.0 - ellipse(p, c + vec2(0.0, -0.062), vec2(0.088, 0.1)));
          eyes += mix(e, arc * open, uHappy);
        }
        float talk = 0.5 + 0.5 * sin(uTime * 17.0);
        vec2 mc = vec2(0.0, -0.21) + look * 0.6;
        float openMouth = ellipse(p, mc, vec2(0.05 - 0.018 * uWow, 0.016 + 0.05 * uTalk * talk + 0.04 * uWow));
        float smile = ellipse(p, mc + vec2(0.0, 0.02), vec2(0.085, 0.06)) * (1.0 - ellipse(p, mc + vec2(0.0, 0.05), vec2(0.1, 0.06)));
        float mouth = mix(openMouth, mix(smile, openMouth, uTalk), uHappy * (1.0 - uWow));
        return clamp(eyes + mouth, 0.0, 1.0);
      }

      void main() {
        vec2 p = vPos.xy;
        float g = 0.0165;                       // dot pitch
        vec2 cell = (floor(p / g) + 0.5) * g;
        float lit = faceMask(cell);
        float dot_ = 1.0 - smoothstep(0.30, 0.46, length(p - cell) / g);
        float scan = 0.9 + 0.1 * sin(p.y * 240.0 - uTime * 3.0);
        vec3 col = uColor * (lit * dot_ * scan * 2.4);
        col += uColor * faceMask(p) * 0.22;     // soft bloom under the dots
        gl_FragColor = vec4(col, 1.0);
      }`,
  });

type Props = { onReady?: () => void };

export default function Aiko({ onReady }: Props) {
  const { scene } = useGLTF(MODEL);
  const { viewport, size, camera } = useThree();
  const rig = useRef<THREE.Group>(null!);
  const face = useMemo(faceMaterial, []);
  const s = useRef({
    pos: new THREE.Vector3(3, 0, 0),
    scale: 0.01,
    ry: 0,
    blinkAt: 2,
    blink: 0,
    happy: 0,
    wow: 0,
    talk: 0,
    lean: 0,
    pitch: 0,
    booted: 0,
  });

  const parts = useMemo(() => {
    const get = (n: string) => scene.getObjectByName(n) as THREE.Object3D;
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (m.name === "Face") {
        m.material = face;
        m.renderOrder = 2;
      } else if (mat.name === "Glow") {
        mat.emissive = new THREE.Color("#7a55ff");
        mat.emissiveIntensity = 1.6;
        mat.toneMapped = false;
      } else {
        // the visor stays dark so reflections never compete with her eyes
        mat.envMapIntensity = mat.name === "Glass" ? 0.4 : 1.15;
      }
    });
    const glow = (scene.getObjectByName("Core") as THREE.Mesh).material as THREE.MeshStandardMaterial;
    return {
      head: get("Head"),
      torso: get("Torso"),
      handL: get("HandL"),
      handR: get("HandR"),
      glow,
    };
  }, [scene, face]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const pose = useMemo<Pose>(() => ({ ...wide[0] }), []);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;
    const st = s.current;
    const poses = size.width / size.height < 0.85 ? narrow : wide;

    // blend the two nearest stop poses
    const f = THREE.MathUtils.clamp(flight.f, 0, poses.length - 1);
    const i = Math.floor(f);
    const j = Math.min(poses.length - 1, i + 1);
    const k = smooth(f - i);
    const a = poses[i];
    const b = poses[j];
    pose.x = THREE.MathUtils.lerp(a.x, b.x, k);
    pose.y = THREE.MathUtils.lerp(a.y, b.y, k);
    pose.s = THREE.MathUtils.lerp(a.s, b.s, k);
    pose.ry = THREE.MathUtils.lerp(a.ry, b.ry, k);
    let near = k < 0.5 ? a : b;
    let flying = Math.min(1, Math.abs(k - Math.round(k)) * 4); // 0 parked, 1 mid-flight
    const o = flight.override;
    if (o) {
      pose.x = o.x;
      pose.y = o.y;
      pose.s = o.s;
      pose.ry = o.ry;
      near = o;
      flying = 0;
    }

    // arc the flight path a little so she swoops instead of sliding
    const tx = (pose.x * viewport.width) / 2;
    const ty = (pose.y * viewport.height) / 2 + (o ? 0 : Math.sin(k * Math.PI) * 0.35 * (i === j ? 0 : 1));

    st.booted = Math.min(1, st.booted + dt * 0.7);
    const boot = 1 - Math.pow(1 - st.booted, 4);

    const px = st.pos.x;
    st.pos.x = THREE.MathUtils.damp(st.pos.x, tx, 3.2, dt);
    st.pos.y = THREE.MathUtils.damp(st.pos.y, ty, 3.2, dt);
    st.scale = THREE.MathUtils.damp(st.scale, pose.s * boot, 3.6, dt);
    const vx = (st.pos.x - px) / Math.max(dt, 1e-3);
    st.lean = THREE.MathUtils.damp(st.lean, THREE.MathUtils.clamp(-vx * 0.09, -0.5, 0.5), 5, dt);
    st.pitch = THREE.MathUtils.damp(st.pitch, THREE.MathUtils.clamp(flight.velocity * 0.004, -0.3, 0.3), 5, dt);
    st.ry = THREE.MathUtils.damp(st.ry, pose.ry + flight.pointer.x * 0.18 + vx * 0.05, 4, dt);

    const g = rig.current;
    g.position.set(st.pos.x, st.pos.y + Math.sin(t * 1.4) * 0.07 * st.scale, 0);
    g.scale.setScalar(st.scale);
    g.rotation.set(st.pitch + Math.sin(t * 0.9) * 0.02, st.ry, st.lean);

    // head follows the cursor, a beat behind the body
    const lookX = flight.pointer.x - (st.pos.x / (viewport.width / 2)) * 0.6;
    const lookY = flight.pointer.y - (st.pos.y / (viewport.height / 2)) * 0.6;
    parts.head.rotation.y = THREE.MathUtils.damp(parts.head.rotation.y, THREE.MathUtils.clamp(lookX, -1, 1) * 0.45 - st.ry * 0.5, 6, dt);
    parts.head.rotation.x = THREE.MathUtils.damp(parts.head.rotation.x, -THREE.MathUtils.clamp(lookY, -1, 1) * 0.28, 6, dt);
    parts.head.rotation.z = Math.sin(t * 0.7) * 0.03 - st.lean * 0.5;
    parts.torso.rotation.z = st.lean * 0.3;

    // hands
    const h = HANDS[flight.shy ? "cover" : flying > 0.6 ? "idle" : near.gesture];
    const sway = Math.sin(t * 1.4 + 1) * 0.04;
    const move = (node: THREE.Object3D, target: readonly number[], side: "L" | "R") => {
      const waving = h.wave === side;
      const wx = waving ? Math.sin(t * 7) * 0.14 : 0;
      node.position.x = THREE.MathUtils.damp(node.position.x, target[0] + wx, 6, dt);
      node.position.y = THREE.MathUtils.damp(node.position.y, target[1] + sway - flying * 0.12, 6, dt);
      node.position.z = THREE.MathUtils.damp(node.position.z, target[2] - flying * 0.3, 6, dt);
      const lift = THREE.MathUtils.clamp((node.position.y - REST.L[1]) / 0.9, 0, 1);
      const dir = side === "L" ? -1 : 1;
      node.rotation.z = THREE.MathUtils.damp(node.rotation.z, dir * lift * 1.1 + (waving ? Math.sin(t * 7) * 0.5 : 0), 8, dt);
      node.rotation.x = THREE.MathUtils.damp(node.rotation.x, -lift * 0.5, 8, dt);
    };
    move(parts.handL, h.L, "L");
    move(parts.handR, h.R, "R");

    // face
    st.blinkAt -= dt;
    if (st.blinkAt < 0) st.blinkAt = 2.2 + Math.random() * 3.5;
    const blinking = flight.shy || st.blinkAt < 0.13 ? 1 : 0;
    st.blink = THREE.MathUtils.damp(st.blink, blinking, 30, dt);
    st.happy = THREE.MathUtils.damp(st.happy, near.mood === "happy" && flying < 0.5 ? 1 : 0, 5, dt);
    st.wow = THREE.MathUtils.damp(st.wow, near.mood === "wow" || flying > 0.7 ? 1 : 0, 5, dt);
    st.talk = THREE.MathUtils.damp(st.talk, flight.talking > 0 ? 1 : 0, 10, dt);
    const u = face.uniforms;
    u.uTime.value = t;
    u.uBlink.value = st.blink;
    u.uHappy.value = st.happy;
    u.uWow.value = st.wow;
    u.uTalk.value = st.talk;
    (u.uLook.value as THREE.Vector2).set(
      THREE.MathUtils.clamp(lookX, -1, 1),
      THREE.MathUtils.clamp(lookY, -1, 1),
    );
    parts.glow.emissiveIntensity = 1.4 + Math.sin(t * 3) * 0.3 + flying * 2.2 + st.talk * 0.6;

    // tell the speech bubble where her head is
    tmp.set(0, 1.45, 0).applyMatrix4(g.matrixWorld).project(camera);
    flight.head.x = (tmp.x * 0.5 + 0.5) * size.width;
    flight.head.y = (-tmp.y * 0.5 + 0.5) * size.height;
    const hx = tmp.x;
    tmp.set(0.75, 1.45, 0).applyMatrix4(g.matrixWorld).project(camera);
    flight.head.r = Math.abs(tmp.x - hx) * 0.5 * size.width;
    flight.head.side = pose.x < -0.7 ? 0 : st.pos.x > 0.2 ? -1 : 1;
    flight.head.visible = st.booted > 0.6;
  });

  return (
    <group ref={rig}>
      {/* centre the model on her middle so scale and rotation pivot there */}
      <primitive object={scene} position={[0, -0.65, 0]} />
    </group>
  );
}
