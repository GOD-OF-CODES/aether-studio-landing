// Shared, mutable flight state. The scroll controller writes it, the 3D scene and the
// speech bubble read it every frame. Kept outside React so nothing re-renders per frame.

import { stops } from "./content";

export type Gesture = "idle" | "wave" | "pointL" | "pointR" | "present" | "up" | "think" | "cover";
export type Mood = "calm" | "happy" | "wow";

export type Pose = {
  x: number; // fraction of half the viewport width, -1..1
  y: number; // fraction of half the viewport height
  s: number; // scale
  ry: number; // body yaw
  gesture: Gesture;
  mood: Mood;
};

export const P = (x: number, y: number, s: number, ry: number, gesture: Gesture = "idle", mood: Mood = "calm"): Pose => ({
  x,
  y,
  s,
  ry,
  gesture,
  mood,
});

// One pose per stop, in stop order. Wide screens: Aiko shares the stage with the copy.
export const wide: Pose[] = [
  P(0.5, -0.04, 1.12, -0.35, "wave", "happy"), // arrival
  P(-0.8, -0.46, 0.58, 0.6, "pointR", "calm"), // studio
  P(0.6, -0.34, 0.74, -0.3, "up", "wow"), // numbers
  P(-0.6, -0.2, 0.5, 0.5, "pointR", "happy"), // create
  P(-0.56, -0.24, 0.5, 0.45, "think", "calm"), // refine
  P(-0.62, -0.18, 0.5, 0.55, "present", "happy"), // keep
  P(0.5, -0.06, 1.16, -0.4, "present", "wow"), // director
  P(-0.5, -0.06, 1.2, 0.36, "wave", "happy"), // aiko
  P(0, -0.02, 0.6, 0, "present", "happy"), // stack
  P(-0.02, -0.52, 0.5, 0.3, "wave", "happy"), // launch
];

// Narrow screens: Aiko is a companion in the corner, stepping forward at the start and for her own section.
const corner = (gesture: Gesture, mood: Mood = "calm") => P(0.62, -0.72, 0.34, -0.35, gesture, mood);
export const narrow: Pose[] = [
  P(0, -0.6, 0.56, -0.15, "wave", "happy"),
  corner("pointL"),
  corner("up", "wow"),
  corner("pointL", "happy"),
  corner("think"),
  corner("present", "happy"),
  corner("present", "wow"),
  corner("wave", "happy"),
  corner("present", "happy"),
  corner("wave", "happy"),
];

export const flight = {
  f: 0, // continuous stop index
  scrollY: 0,
  velocity: 0, // px per frame, smoothed
  pointer: { x: 0, y: 0 }, // -1..1
  director: -1, // index into directors, -1 = house lighting
  talking: 0, // > 0 while the bubble is typing
  head: { x: 0, y: 0, r: 60, side: 1, visible: false }, // Aiko's head in CSS px, for the bubble
  on: false, // true once the 3D scene is running
  override: null as Pose | null, // pages without a route (sign in, sign up) park Aiko here
  shy: false, // she covers her eyes while a password is typed
};

export const STOP_COUNT = stops.length;

/** Weight of a stop: 1 when Aiko is parked there, falling to 0 a full stop away. */
export const weight = (i: number) => Math.max(0, 1 - Math.abs(flight.f - i));

export const smooth = (t: number) => t * t * (3 - 2 * t);

// ---- small UI store: which stop is active, and anything Aiko has been asked to say ----
type Listener = () => void;
const listeners = new Set<Listener>();
export const ui = { stop: 0, say: null as string | null, sayId: 0 };
export const subscribe = (l: Listener) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const emit = () => listeners.forEach((l) => l());
export const setStop = (i: number) => {
  if (ui.stop !== i) {
    ui.stop = i;
    ui.say = null;
    emit();
  }
};
export const say = (text: string) => {
  ui.say = text;
  ui.sayId++;
  emit();
};
export const getStop = () => ui.stop;
export const getSayId = () => ui.sayId;
export const resetSay = () => {
  ui.say = null;
  ui.sayId++;
  emit();
};
