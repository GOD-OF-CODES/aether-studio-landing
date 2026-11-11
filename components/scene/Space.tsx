"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { flight, weight, smooth } from "@/lib/flight";
import { directors } from "@/lib/content";

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
    return v;
  }
`;

const HOUSE = { key: "#fff1e0", rim: "#7a5cff", nebA: "#24166a", nebB: "#07303c" };

/** Lights and nebula colours. Director Mode relights the whole scene. */
export function Mood() {
  const key = useRef<THREE.DirectionalLight>(null!);
  const rim = useRef<THREE.PointLight>(null!);
  const rim2 = useRef<THREE.PointLight>(null!);
  const neb = useRef<THREE.ShaderMaterial>(null!);
  const c = useMemo(
    () => ({
      key: new THREE.Color(HOUSE.key),
      rim: new THREE.Color(HOUSE.rim),
      a: new THREE.Color(HOUSE.nebA),
      b: new THREE.Color(HOUSE.nebB),
      t: new THREE.Color(),
    }),
    [],
  );
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uAspect: { value: 1 },
      uA: { value: new THREE.Color(HOUSE.nebA) },
      uB: { value: new THREE.Color(HOUSE.nebB) },
      uGain: { value: 1 },
    }),
    [],
  );

  useFrame((state, dt) => {
    const uniforms = neb.current.uniforms;
    const d = flight.director >= 0 ? directors[flight.director] : HOUSE;
    const k = 1 - Math.exp(-dt * 3.2);
    c.key.lerp(c.t.set(d.key), k);
    c.rim.lerp(c.t.set(d.rim), k);
    c.a.lerp(c.t.set(d.nebA), k);
    c.b.lerp(c.t.set(d.nebB), k);
    key.current.color.copy(c.key);
    rim.current.color.copy(c.rim);
    rim2.current.color.copy(c.rim);
    uniforms.uA.value.copy(c.a);
    uniforms.uB.value.copy(c.b);
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uScroll.value = flight.scrollY * 0.00022;
    uniforms.uAspect.value = state.size.width / state.size.height;
    const directing = flight.director >= 0;
    uniforms.uGain.value = THREE.MathUtils.damp(uniforms.uGain.value, directing ? 2.6 : 1, 3, dt);
    // under a director, the coloured lights take over from the neutral studio reflections
    state.scene.environmentIntensity = THREE.MathUtils.damp(state.scene.environmentIntensity, directing ? 0.22 : 1, 3, dt);
    key.current.intensity = THREE.MathUtils.damp(key.current.intensity, directing ? 3.4 : 2.3, 3, dt);
    rim.current.intensity = THREE.MathUtils.damp(rim.current.intensity, directing ? 420 : 90, 3, dt);
    rim2.current.intensity = THREE.MathUtils.damp(rim2.current.intensity, directing ? 200 : 40, 3, dt);
  });

  return (
    <>
      <ambientLight intensity={0.22} color="#8f9cff" />
      <directionalLight ref={key} position={[-4, 5, 6]} intensity={2.3} />
      <pointLight ref={rim} position={[5, 2.5, -3.5]} intensity={90} distance={30} />
      <pointLight ref={rim2} position={[-5, -3, -3]} intensity={40} distance={30} />
      <mesh frustumCulled={false} renderOrder={-10}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={neb}
          depthTest={false}
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={/* glsl */ `
            varying vec2 vUv;
            void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }`}
          fragmentShader={/* glsl */ `
            varying vec2 vUv;
            uniform float uTime, uScroll, uAspect, uGain;
            uniform vec3 uA, uB;
            ${NOISE}
            void main() {
              vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
              vec2 q = p * 1.5 + vec2(0.0, -uScroll);
              float n = fbm(q + fbm(q * 1.7 + uTime * 0.012) * 0.9);
              float m = fbm(q * 0.7 + 40.0 - uTime * 0.008);
              vec3 col = vec3(0.012, 0.014, 0.03);
              col += uA * smoothstep(0.22, 0.78, n) * 0.62 * uGain;
              col += uB * smoothstep(0.3, 0.8, m) * 0.5 * uGain;
              col *= 1.0 - 0.55 * dot(p, p);
              col += (hash(vUv * 900.0 + uTime) - 0.5) * 0.012;   // dither, hides banding
              gl_FragColor = vec4(col, 1.0);
            }`}
        />
      </mesh>
    </>
  );
}

/** Stars you fly through: scrolling pushes the camera forward. */
export function Stars({ count = 2400 }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const travel = useRef(0);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = Math.random() * 60;
      seed[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);
  const uniforms = useMemo(
    () => ({ uTravel: { value: 0 }, uTime: { value: 0 }, uPx: { value: 1 }, uWarp: { value: 0 } }),
    [],
  );

  useFrame((state, dt) => {
    const uniforms = mat.current.uniforms;
    travel.current += dt * 0.35 + Math.abs(flight.velocity) * 0.012;
    uniforms.uTravel.value = travel.current;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPx.value = state.viewport.dpr * (state.size.height / 900);
    uniforms.uWarp.value = THREE.MathUtils.damp(uniforms.uWarp.value, Math.min(1, Math.abs(flight.velocity) / 60), 6, dt);
  });

  return (
    <points geometry={geo} frustumCulled={false} renderOrder={-5}>
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          attribute float aSeed;
          uniform float uTravel, uTime, uPx, uWarp;
          varying float vA;
          varying float vSeed;
          void main() {
            vec3 p = position;
            p.z = mod(p.z + uTravel, 60.0) - 54.0;          // -54 .. 6, wraps past the camera
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float tw = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed * 2.0) + aSeed * 40.0);
            float size = mix(1.0, 3.4, pow(aSeed, 5.0)) + uWarp * 1.4;
            gl_PointSize = max(1.2, size * uPx * (64.0 / -mv.z));
            vA = smoothstep(-54.0, -40.0, p.z) * (1.0 - smoothstep(0.0, 6.0, p.z)) * tw;
            vSeed = aSeed;
          }`}
        fragmentShader={/* glsl */ `
          varying float vA;
          varying float vSeed;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            vec3 col = mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.88, 0.72), step(0.72, vSeed));
            gl_FragColor = vec4(col * a * a * vA, 1.0);
          }`}
      />
    </points>
  );
}

type PlanetProps = { stop: number; a: string; b: string; c: string; ring?: boolean; x: number; y: number; r: number };

/** One procedural planet per feature chapter. It rises as Aiko arrives and sets as she leaves. */
function Planet({ stop, a, b, c, ring, x, y, r }: PlanetProps) {
  const g = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const { viewport, size } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uA: { value: new THREE.Color(a) },
      uB: { value: new THREE.Color(b) },
      uC: { value: new THREE.Color(c) },
      uSeed: { value: stop * 7.3 },
    }),
    [a, b, c, stop],
  );

  useFrame((state) => {
    const narrowScreen = size.width / size.height < 0.85;
    const w = smooth(weight(stop));
    const side = flight.f < stop ? -1 : 1;
    const px = narrowScreen ? 0.1 : x;
    const py = narrowScreen ? -1.12 : y; // on a phone the planet is a horizon under the list, not behind it
    g.current.visible = w > 0.002;
    g.current.position.set(
      (px * viewport.width) / 2,
      (py * viewport.height) / 2 - (1 - w) * side * viewport.height * 0.9,
      -4,
    );
    g.current.scale.setScalar(r * (0.75 + 0.25 * w) * (narrowScreen ? 0.5 : 1));
    g.current.rotation.y = state.clock.elapsedTime * 0.04;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group ref={g} rotation={[0.25, 0, 0.18]}>
      <mesh>
        <sphereGeometry args={[1, 64, 48]} />
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          vertexShader={/* glsl */ `
            varying vec3 vN; varying vec3 vP; varying vec3 vV;
            void main() {
              vP = position;
              vN = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vV = normalize(-mv.xyz);
              gl_Position = projectionMatrix * mv;
            }`}
          fragmentShader={/* glsl */ `
            varying vec3 vN; varying vec3 vP; varying vec3 vV;
            uniform vec3 uA, uB, uC; uniform float uTime, uSeed;
            ${NOISE}
            void main() {
              float lon = atan(vP.z, vP.x);
              vec2 q = vec2(lon * 1.2, vP.y * 3.4 + uSeed);
              float warp = fbm(q * 1.6 + uSeed);
              float bands = fbm(vec2(q.x * 0.5 + warp * 1.4, q.y * 2.2));
              vec3 col = mix(uA, uB, smoothstep(0.3, 0.7, bands));
              col = mix(col, uC, smoothstep(0.62, 0.9, fbm(q * 3.0 + 9.0)));
              vec3 L = normalize(vec3(-0.7, 0.55, 0.6));
              float d = dot(vN, L);
              float lit = smoothstep(-0.15, 0.9, d);
              float fres = pow(1.0 - max(dot(vN, vV), 0.0), 2.6);
              col = col * (0.035 + lit) + uB * fres * (0.25 + 0.9 * smoothstep(-0.3, 0.4, d));
              gl_FragColor = vec4(col, 1.0);
            }`}
        />
      </mesh>
      {ring && (
        <mesh rotation={[Math.PI / 2 - 0.32, 0, 0]}>
          <ringGeometry args={[1.35, 2.1, 128, 1]} />
          <shaderMaterial
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
            uniforms={uniforms}
            vertexShader={/* glsl */ `
              varying vec3 vP;
              void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
            fragmentShader={/* glsl */ `
              varying vec3 vP; uniform vec3 uB, uC;
              ${NOISE}
              void main() {
                float r = length(vP.xy);
                float t = (r - 1.35) / 0.75;
                float grooves = 0.35 + 0.65 * noise(vec2(r * 46.0, 0.0));
                float a = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.85, 1.0, t)) * grooves;
                gl_FragColor = vec4(mix(uC, uB, t) * 0.9, a * 0.62);
              }`}
          />
        </mesh>
      )}
    </group>
  );
}

export function Planets() {
  return (
    <>
      <Planet stop={3} a="#2a1466" b="#8f6bff" c="#e8d9ff" ring x={-0.72} y={-0.58} r={1.75} />
      <Planet stop={4} a="#063c40" b="#3fd0c0" c="#e9fffb" x={-0.66} y={-0.62} r={1.9} />
      <Planet stop={5} a="#4a2206" b="#ffa94d" c="#fff0d4" x={-0.74} y={-0.52} r={1.6} />
    </>
  );
}

/** The four numbers, as a constellation Aiko points up at. */
export function Constellation({ stop = 2 }) {
  const { viewport, size } = useThree();
  const g = useRef<THREE.Group>(null!);
  const line = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(4 * 3), 3));
    const mat = new THREE.LineBasicMaterial({ color: "#ffb454", transparent: true, opacity: 0.55 });
    return new THREE.Line(geo, mat);
  }, []);
  const stars = useRef<THREE.Mesh[]>([]);
  const pts = useMemo(() => [
    [0.3, 0.62], [0.5, 0.34], [0.72, 0.66], [0.9, 0.4],
  ], []);

  useFrame((state) => {
    const narrowScreen = size.width / size.height < 0.85;
    const w = smooth(weight(stop));
    g.current.visible = w > 0.01 && !narrowScreen;
    const arr = line.geometry.attributes.position as THREE.BufferAttribute;
    pts.forEach(([x, y], i) => {
      const wx = (x * viewport.width) / 2;
      const wy = (y * viewport.height) / 2;
      arr.setXYZ(i, wx, wy, -1);
      const m = stars.current[i];
      if (m) {
        m.position.set(wx, wy, -1);
        const on = smooth(THREE.MathUtils.clamp(w * 4 - i * 0.6, 0, 1));
        m.scale.setScalar(on * (0.07 + 0.012 * Math.sin(state.clock.elapsedTime * 2 + i)));
      }
    });
    arr.needsUpdate = true;
    line.geometry.setDrawRange(0, Math.max(0, Math.min(4, Math.floor(w * 5.2))));
    (line.material as THREE.LineBasicMaterial).opacity = 0.55 * w;
  });

  return (
    <group ref={g}>
      <primitive object={line} />
      {pts.map((_, i) => (
        <mesh key={i} ref={(m) => { if (m) stars.current[i] = m; }}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** The finale: a black hole with a lensed accretion disc. You fall toward it as the last section arrives. */
export function BlackHole({ stop = 9 }) {
  const m = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const { viewport, size } = useThree();
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uW: { value: 0 } }), []);

  useFrame((state) => {
    const narrowScreen = size.width / size.height < 0.85;
    const w = smooth(weight(stop));
    m.current.visible = w > 0.002;
    const sc = (narrowScreen ? 4.6 : 8.6) * (0.3 + 0.7 * w);
    m.current.scale.set(sc, sc, 1);
    m.current.position.set(
      ((narrowScreen ? 0.1 : 0.5) * viewport.width) / 2,
      ((narrowScreen ? 0.42 : 0.16) * viewport.height) / 2,
      -6,
    );
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uW.value = w;
  });

  return (
    <mesh ref={m}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
        fragmentShader={/* glsl */ `
          varying vec2 vUv;
          uniform float uTime, uW;
          ${NOISE}

          // brightness of the disc at disc-plane coordinates q
          float disc(vec2 q, float inner, float outer) {
            float r = length(q);
            float a = atan(q.y, q.x);
            float band = smoothstep(inner, inner + 0.02, r) * (1.0 - smoothstep(inner + 0.04, outer, r));
            float swirl = fbm(vec2(a * 2.2 - uTime * 0.25 / max(r, 0.08) * 0.12 + r * 9.0, r * 26.0));
            float streaks = 0.45 + 0.9 * swirl;
            float doppler = 0.55 + 0.75 * (0.5 + 0.5 * cos(a - 2.6));   // approaching side is brighter
            return band * streaks * doppler;
          }

          void main() {
            vec2 p = (vUv - 0.5) * 2.0;
            float tiltA = -0.34;
            p = mat2(cos(tiltA), -sin(tiltA), sin(tiltA), cos(tiltA)) * p;
            float r = length(p);
            float rs = 0.2;                                  // shadow radius
            vec3 hot = vec3(1.0, 0.86, 0.62), warm = vec3(1.0, 0.5, 0.14);

            // the disc seen nearly edge-on
            vec2 q = vec2(p.x, p.y / 0.16);
            float dAll = disc(q, rs * 1.25, 0.95);
            float far = dAll * step(0.0, p.y);
            float nearD = dAll * step(p.y, 0.0);

            // light from the far side of the disc, bent over and under the shadow
            float ang = atan(p.y, p.x);
            float hd = (r - rs * 1.34) / 0.045;
            float halo = exp(-hd * hd);
            halo *= 0.55 + 0.45 * fbm(vec2(ang * 3.0 + uTime * 0.2, 3.0));
            halo *= 0.5 + 0.5 * smoothstep(-0.9, 0.6, sin(ang));          // brighter over the top
            float pd = (r - rs * 1.04) / 0.008;
            float photon = exp(-pd * pd) * 0.9;

            float shadow = smoothstep(rs * 0.98, rs * 1.03, r);
            vec3 col = vec3(0.0);
            col += mix(warm, hot, far) * far * 1.5 * shadow;
            col += mix(warm, hot, halo) * halo * 1.25;
            col += hot * photon;
            col *= shadow;
            col += mix(warm, hot, nearD) * nearD * 1.9;                    // near side passes in front
            col += warm * 0.06 * exp(-r * 3.2);                            // faint glow
            float edge = 1.0 - smoothstep(0.75, 1.0, length((vUv - 0.5) * 2.0));
            gl_FragColor = vec4(col * edge * uW, 1.0);
          }`}
      />
    </mesh>
  );
}
