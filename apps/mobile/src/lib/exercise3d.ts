import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import type { ExpoWebGLRenderingContext } from "expo-gl";

/**
 * Shared 3D character asset — a constant, not a DB row. Changing the base
 * character means re-authoring every animation clip against a new
 * skeleton anyway, so it's a code concern, not independent content. Filled
 * in by the first run of database/src/seed/uploadExerciseAnimations.ts,
 * which prints the real Blob URL to paste here.
 */
export const CHARACTER_MODEL_URL = "";

export interface ExerciseScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  mixer: THREE.AnimationMixer;
}

function isFbx(url: string): boolean {
  return url.toLowerCase().endsWith(".fbx");
}

async function loadModel(url: string): Promise<THREE.Object3D> {
  if (isFbx(url)) return new FBXLoader().loadAsync(url);
  const gltf = await new GLTFLoader().loadAsync(url);
  return gltf.scene;
}

async function loadAnimationClip(url: string): Promise<THREE.AnimationClip | null> {
  if (isFbx(url)) {
    const fbx = await new FBXLoader().loadAsync(url);
    return fbx.animations[0] ?? null;
  }
  const gltf = await new GLTFLoader().loadAsync(url);
  return gltf.animations[0] ?? null;
}

/**
 * Loads the shared character once and the exercise-specific animation
 * clip separately, then applies the clip to the character by bone name —
 * the standard Mixamo workflow ("with skin" once, "without skin" per
 * clip) for keeping per-exercise downloads small.
 */
export async function buildExerciseScene(
  gl: ExpoWebGLRenderingContext,
  animationUrl: string,
): Promise<ExerciseScene> {
  const renderer = new THREE.WebGLRenderer({ context: gl as unknown as WebGLRenderingContext, antialias: true });
  renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
  renderer.setClearColor(0x0a0a0a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100);
  camera.position.set(0, 1.2, 4);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.position.set(2, 4, 3);
  scene.add(directional);

  const character = await loadModel(CHARACTER_MODEL_URL);
  scene.add(character);

  const clip = await loadAnimationClip(animationUrl);
  const mixer = new THREE.AnimationMixer(character);
  if (clip) mixer.clipAction(clip).play();

  return { renderer, scene, camera, mixer };
}
