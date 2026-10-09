import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Group,
  PerspectiveCamera,
  Vector3,
  Mesh,
  MeshStandardMaterial,
  Matrix4,
} from "three";
import { HeroTyre } from "./actors/HeroTyre";
import { Conveyor } from "./actors/Conveyor";
import { InspectionCell } from "./actors/InspectionCell";
import { InspectionHead } from "./actors/InspectionHead";
import { MeasurementShell } from "../surface/MeasurementShell";
import { experienceClock } from "../core/ExperienceClock";
import { directStory } from "../core/StoryDirector";
import { worldAt } from "./WorldDirector";
import { cameraAt } from "../camera/CameraDirector";
import { blendProjection } from "../camera/cameraMath";
import { dataDirector } from "../core/DataDirector";
import { useExperienceStore } from "../state/experienceStore";
import { AnalyticalEvidenceWorld } from "./AnalyticalEvidenceWorld";
import { FrameBudgetMonitor } from "../core/QualityController";
import {
  hasFrameSubscribers,
  publishFrame,
  type FrameTelemetry,
} from "../core/AnnotationRegistry";
import { writeEncoderReadout } from "../core/EncoderReadout";
type DatasetKey =
  | "progress"
  | "scene"
  | "beat"
  | "unwrap"
  | "theta"
  | "hero"
  | "surface"
  | "camera"
  | "quality"
  | "frameMs"
  | "fps"
  | "drawCalls"
  | "triangles";
function writeDataset(
  canvas: HTMLCanvasElement,
  written: Map<string, string>,
  key: DatasetKey,
  value: string,
) {
  if (written.get(key) === value) return;
  written.set(key, value);
  canvas.dataset[key] = value;
}
function collectStandardMaterials(root: Group) {
  const found = new Set<MeshStandardMaterial>();
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const mat of materials)
      if (mat instanceof MeshStandardMaterial) {
        if (mat.userData.originalOpacity === undefined) {
          mat.userData.originalOpacity = mat.opacity;
          mat.userData.originalTransparent = mat.transparent;
          mat.userData.originalDepthWrite = mat.depthWrite;
        }
        found.add(mat);
      }
  });
  return [...found];
}
/** Clock, journey and camera run first (priority -1) so every actor and projected label reads the same frame. */
const FRAME_PRIORITY = -1;
export function ProductionWorld() {
  const lowPower = useExperienceStore((s) => s.lowPower);
  const candidateNozzle = useExperienceStore((s) => s.candidateNozzle);
  const lastPhysical = useRef(-1);
  const physicalMaterials = useRef<MeshStandardMaterial[] | null>(null);
  const written = useRef(new Map<string, string>());
  const frameStats = useRef({ count: 0, total: 0 });
  const frameBudget = useRef(new FrameBudgetMonitor());
  const physical = useRef<Group>(null),
    tyre = useRef<Group>(null),
    head = useRef<Group>(null);
  const light = useRef<import("three").PointLight>(null);
  const { camera, size, gl } = useThree();
  const target = useRef(new Vector3());
  const ortho = useRef(new Matrix4());
  const telemetry = useRef<FrameTelemetry>({
    now: 0,
    progress: 0,
    localProgress: 0,
    sceneId: "",
    beatId: "",
    frameMs: "",
    fps: "",
    quality: "",
    camera: "",
    theta: "",
    unwrap: "",
    drawCalls: 0,
    triangles: 0,
  });
  const detail = lowPower || size.width < 700 ? "low" : "high";
  useEffect(() => {
    physicalMaterials.current = null;
    lastPhysical.current = -1;
  }, [detail]);
  useEffect(() => {
    useExperienceStore.getState().setReady();
    const canvas = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      useExperienceStore.getState().setWebgl(false);
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl]);
  useEffect(() => {
    gl.domElement.dataset.observationHash =
      dataDirector.observationFingerprint();
  }, [candidateNozzle, gl]);
  useFrame((_, dt) => {
    const canvas = gl.domElement,
      cache = written.current,
      t = telemetry.current;
    frameStats.current.count++;
    frameStats.current.total += dt;
    if (frameStats.current.count % 30 === 0) {
      t.frameMs = (
        (frameStats.current.total / frameStats.current.count) *
        1000
      ).toFixed(1);
      t.fps = (frameStats.current.count / frameStats.current.total).toFixed(1);
      writeDataset(canvas, cache, "frameMs", t.frameMs);
      writeDataset(canvas, cache, "fps", t.fps);
    }
    if (
      frameBudget.current.observe(dt) &&
      !useExperienceStore.getState().lowPower
    )
      useExperienceStore.getState().setLowPower(true);
    const p = experienceClock.tick(dt);
    const j = directStory(p),
      s = worldAt(j.sceneIndex, j.localProgress);
    const profile =
      size.width < 700 ? "mobile" : size.width < 1200 ? "tablet" : "desktop";
    const pose = cameraAt(j.sceneIndex, j.localProgress, profile);
    camera.position.set(...pose.position);
    target.current.set(...pose.target);
    camera.lookAt(target.current);
    if (camera instanceof PerspectiveCamera) {
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
      const blend = s.unwrap;
      if (blend > 0) {
        const distance = camera.position.distanceTo(target.current);
        blendProjection(
          camera.projectionMatrix,
          distance,
          pose.fov,
          size.width / size.height,
          camera.near,
          camera.far,
          blend,
          camera.projectionMatrix,
          ortho.current,
        );
        camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
      }
    }
    if (tyre.current) {
      tyre.current.position.set(s.tyreX, 1.1, 0);
      tyre.current.rotation.y = s.rotation;
    }
    if (head.current) head.current.position.y = s.deployment * 1.05;
    if (light.current) light.current.intensity = s.illumination * 7;
    if (
      physical.current &&
      Math.abs(lastPhysical.current - s.physical) > 1e-5
    ) {
      lastPhysical.current = s.physical;
      physical.current.visible = s.physical > 0.001;
      physicalMaterials.current ??= collectStandardMaterials(physical.current);
      for (const mat of physicalMaterials.current) {
        const transparent =
          mat.userData.originalTransparent || s.physical < 0.999;
        if (mat.transparent !== transparent) {
          mat.transparent = transparent;
          mat.needsUpdate = true;
        }
        mat.opacity = mat.userData.originalOpacity * s.physical;
        mat.depthWrite = mat.userData.originalDepthWrite && s.physical > 0.5;
      }
    }
    camera.updateMatrixWorld();
    writeEncoderReadout(s.rotation, s.acquisition);
    const position = camera.position;
    t.now = performance.now();
    t.progress = p;
    t.localProgress = j.localProgress;
    t.sceneId = j.sceneId;
    t.beatId = j.beat.id;
    t.quality = lowPower ? "low-power" : profile;
    t.camera = `${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`;
    t.theta = ((s.rotation * 180) / Math.PI).toFixed(3);
    t.unwrap = s.unwrap.toFixed(4);
    t.drawCalls = gl.info.render.calls;
    t.triangles = gl.info.render.triangles;
    writeDataset(canvas, cache, "camera", t.camera);
    writeDataset(canvas, cache, "quality", t.quality);
    writeDataset(canvas, cache, "drawCalls", String(t.drawCalls));
    writeDataset(canvas, cache, "triangles", String(t.triangles));
    writeDataset(canvas, cache, "scene", j.sceneId);
    writeDataset(canvas, cache, "hero", dataDirector.hero.id);
    writeDataset(
      canvas,
      cache,
      "surface",
      dataDirector.hero.surface.metadata.seed,
    );
    writeDataset(canvas, cache, "theta", t.theta);
    writeDataset(canvas, cache, "beat", j.beat.id);
    writeDataset(canvas, cache, "unwrap", t.unwrap);
    writeDataset(canvas, cache, "progress", p.toFixed(4));
    if (hasFrameSubscribers()) publishFrame(t);
  }, FRAME_PRIORITY);
  return (
    <>
      <ambientLight intensity={0.65} />
      <hemisphereLight args={["#d6e1de", "#303738", 1.5]} />
      <directionalLight
        position={[2, 8, 5]}
        intensity={3}
        color="#e9e4d5"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight
        ref={light}
        position={[0, 1.6, 0]}
        color="#e8f3f1"
        intensity={0}
      />
      <group ref={physical} name="persistent-production-environment">
        <Conveyor />
        <InspectionCell />
        <group ref={tyre} position={[-4, 1.1, 0]}>
          <HeroTyre detail={detail} />
        </group>
        <group ref={head}>
          <InspectionHead />
        </group>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.11, 0]}
          receiveShadow
        >
          <planeGeometry args={[70, 50]} />
          <meshStandardMaterial color="#293436" roughness={0.94} />
        </mesh>
        {[-12, -6, 6, 12].map((x) => (
          <group key={x}>
            <mesh position={[x, 3.8, -7]}>
              <boxGeometry args={[0.25, 8, 0.25]} />
              <meshStandardMaterial
                color="#3e4a4e"
                metalness={0.6}
                roughness={0.7}
              />
            </mesh>
            <mesh position={[x, 7.5, -2]}>
              <boxGeometry args={[0.22, 0.25, 15]} />
              <meshStandardMaterial
                color="#3e4a4e"
                metalness={0.6}
                roughness={0.7}
              />
            </mesh>
          </group>
        ))}
        {[-7, 0, 7].map((x) => (
          <mesh key={x} position={[x, 6, -6]}>
            <boxGeometry args={[4, 0.025, 0.22]} />
            <meshStandardMaterial
              color="#bcc7bd"
              emissive="#d2d8c3"
              emissiveIntensity={1}
            />
          </mesh>
        ))}
      </group>
      <MeasurementShell field={dataDirector.hero.surface} />
      <AnalyticalEvidenceWorld />
    </>
  );
}
