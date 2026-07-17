// Dev-only pipeline: merges the Mixamo character FBX + animation FBXs into a
// single boss.glb. Run via tools/run-convert.mjs against the vite dev server.
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import type { AnimationClip } from "three";

const CLIPS: Array<[name: string, file: string]> = [
  ["idle", "Idle"],
  ["taunt", "Taunt"],
  ["point", "Pointing"],
  ["shake_fist", "Shake Fist"],
  ["angry_gesture", "Angry Gesture"],
  ["yell", "Yelling"],
  ["hit_head", "Head Hit"],
  ["hit_body", "Getting Hit"],
  ["hit_side", "Standing React Large From Right"],
  ["stumble", "Stumble Backwards"],
  ["dizzy", "Dizzy Idle"],
  ["knockout", "Knocked Out"],
  ["getup", "Getting Up"],
];

const log = (m: string): void => {
  document.getElementById("log")!.textContent += `\n${m}`;
  console.log(m);
};

const loader = new FBXLoader();
const char = await loader.loadAsync("/assets_src/mixamo/Ch33_nonPBR.fbx");
log(`character loaded`);

const clips: AnimationClip[] = [];
for (const [name, file] of CLIPS) {
  const f = await loader.loadAsync(`/assets_src/mixamo/${encodeURIComponent(file)}.fbx`);
  const clip = f.animations[0];
  clip.name = name;
  clips.push(clip);
  log(`clip ${name} (${clip.duration.toFixed(2)}s, ${clip.tracks.length} tracks)`);
}
char.animations = clips;

const exporter = new GLTFExporter();
const glb = (await exporter.parseAsync(char, { binary: true, animations: clips })) as ArrayBuffer;
log(`glb bytes: ${glb.byteLength}`);

const a = document.createElement("a");
a.href = URL.createObjectURL(new Blob([glb]));
a.download = "boss.glb";
a.click();
document.title = "DONE";
