import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";
import type { Object3D } from "three";
import type { DataTexture } from "three";
import { dataDirector } from "../core/DataDirector";
import { experienceClock, segment, lerp } from "../core/ExperienceClock";
import { resolveJourney } from "../core/JourneyController";
import { curvedPosition, flatPosition } from "../surface/surfaceCoordinates";
import {
  createSurfaceTexture,
  createAnalysisTexture,
  createExpectationTexture,
} from "../surface/SurfaceTextures";
import {
  createProcessSchematic,
  type SchematicGeometry,
} from "./actors/ProcessSchematic";
import { useExperienceStore } from "../state/experienceStore";
import { projectCaption } from "../core/ProjectionAnnotations";
import type { AnnotationKey } from "../core/AnnotationRegistry";

export interface AnalyticalState {
  population: number;
  alignment: number;
  normal: number;
  variation: number;
  process: number;
  nozzle: number;
  history: number;
  spatial: number;
  historyCurved: number;
  exterior: number;
  nextArrival: number;
}
export function analyticalStateAt(
  scene: number,
  progress: number,
): AnalyticalState {
  const p = Math.max(0, Math.min(1, progress));
  const empty: AnalyticalState = {
    population: 0,
    alignment: 0,
    normal: 0,
    variation: 0,
    process: 0,
    nozzle: 0,
    history: 0,
    spatial: 0,
    historyCurved: 0,
    exterior: 0,
    nextArrival: 0,
  };
  if (scene === 3)
    return {
      ...empty,
      population: segment(p, 0.07, 0.2) * (1 - segment(p, 0.44, 0.63)),
      alignment: segment(p, 0.33, 0.44),
      normal: segment(p, 0.44, 0.54),
      variation: segment(p, 0.54, 0.63),
    };
  if (scene === 4)
    return {
      ...empty,
      alignment: 1,
      normal: 1 - segment(p, 0.64, 0.8),
      variation: 1 - segment(p, 0.06, 0.2),
      process: segment(p, 0.54, 0.64) * (1 - segment(p, 0.94, 1)),
      nozzle: segment(p, 0.2, 0.29) * (1 - segment(p, 0.9, 0.97)),
    };
  if (scene === 5)
    return {
      ...empty,
      alignment: 1,
      history:
        segment(p, 0.06, 0.14) *
        (1 - segment(p, 0.7, 0.74) + segment(p, 0.88, 0.92)),
      spatial: segment(p, 0.48, 0.5) * (1 - segment(p, 0.59, 0.61)),
      process: segment(p, 0.74, 0.78) * (1 - segment(p, 0.82, 0.86)),
      nozzle: segment(p, 0.74, 0.78) * (1 - segment(p, 0.82, 0.86)),
      historyCurved: segment(p, 0.92, 0.985),
      exterior: segment(p, 0.965, 0.99),
      nextArrival: segment(p, 0.965, 1),
    };
  return empty;
}
export function historyActorPose(
  recordSlot: number,
  count: number,
  state: AnalyticalState,
  mobile: boolean,
) {
  const x = mobile
    ? 0
    : lerp(
        -0.1 + recordSlot * 0.8,
        -0.45 + (recordSlot - 2) * 1.4,
        state.spatial,
      );
  const flatY = mobile ? 2.6 - (recordSlot - 2) * 0.6 : 2.4;
  const shown = recordSlot < count - 3 ? (mobile ? 0 : 1 - state.spatial) : 1;
  const conveyorX = 7.4 + recordSlot * 3.3;
  return {
    recordSlot,
    position: [
      lerp(x, conveyorX, state.historyCurved),
      lerp(flatY, 1.1, state.historyCurved),
      lerp(-0.25, 0, state.historyCurved),
    ] as [number, number, number],
    scale: lerp(
      mobile ? 0.24 : lerp(0.12, 0.2, state.spatial),
      1,
      state.historyCurved,
    ),
    scaleX: lerp(
      mobile ? 0.54 : lerp(0.12, 0.2, state.spatial),
      1,
      state.historyCurved,
    ),
    unwrap: 1 - state.historyCurved,
    opacity: state.history * shown,
    exteriorOpacity: state.exterior * shown,
  };
}
/** Projected spray geometry: the recorded state in Scene 04, the what-if candidate in Scene 05. */
export function schematicGeometryAt(
  scene: number,
  candidateNozzle: number,
): SchematicGeometry {
  const schematic =
    scene === 5
      ? dataDirector.processSchematic({ nozzlePosition: candidateNozzle })
      : dataDirector.processSchematic();
  return {
    aimS: schematic.aimS,
    sigmaS: schematic.sigmaS,
    sprayStartTheta: schematic.sprayStartTheta,
  };
}
interface CachedOpacity {
  materials: MeshStandardMaterial[];
  opacity: number;
}
const exteriorCache = new WeakMap<Object3D, CachedOpacity>();
/** Fades every standard material below `root`; materials are collected once per root. */
function setExteriorOpacity(root: Object3D, opacity: number) {
  let entry = exteriorCache.get(root);
  if (!entry) {
    const materials: MeshStandardMaterial[] = [];
    root.traverse((object) => {
      if (
        object instanceof Mesh &&
        object.material instanceof MeshStandardMaterial
      )
        materials.push(object.material);
    });
    entry = { materials, opacity: Number.NaN };
    exteriorCache.set(root, entry);
  }
  if (entry.opacity === opacity) return;
  entry.opacity = opacity;
  for (const material of entry.materials) material.opacity = opacity;
}
const captionKeys: Partial<Record<number, AnnotationKey>> = {
  4: "caption-normal-mean",
  5: "caption-normal-variation",
  6: "caption-process-expectation",
};
function evidenceGeometry() {
  const g = new BufferGeometry(),
    curved: number[] = [],
    flat: number[] = [],
    uv: number[] = [],
    indices: number[] = [];
  const w = 64,
    h = 24;
  for (let y = 0; y <= h; y++)
    for (let x = 0; x <= w; x++) {
      const u = x / w,
        v = y / h;
      curved.push(...curvedPosition(u, v));
      flat.push(...flatPosition(u, v));
      uv.push(u, v);
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const a = y * (w + 1) + x;
      indices.push(a, a + w + 1, a + 1, a + 1, a + w + 1, a + w + 2);
    }
  g.setAttribute("position", new Float32BufferAttribute(curved, 3));
  g.setAttribute("aFlat", new Float32BufferAttribute(flat, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
const vertexShader = `attribute vec3 aFlat;uniform float uUnwrap;varying vec2 vUv;void main(){vUv=uv;float front=clamp((uUnwrap*1.2-uv.x)/.2,0.,1.);front=front*front*(3.-2.*front);gl_Position=projectionMatrix*modelViewMatrix*vec4(mix(position,aFlat,front),1.);}`;
const fragmentShader = `uniform sampler2D uField;uniform sampler2D uAnalysis;uniform sampler2D uExpectation;uniform float uMode;uniform float uOpacity;uniform float uSpatial;varying vec2 vUv;void main(){vec4 f=texture2D(uField,vUv);vec4 a=texture2D(uAnalysis,vUv);vec4 e=texture2D(uExpectation,vUv);float value=f.r;vec3 low=vec3(.12,.26,.32),high=vec3(.60,.77,.79);if(uMode>.5&&uMode<1.5)value=a.r;if(uMode>1.5&&uMode<2.5)value=a.g;if(uMode>2.5&&uMode<4.5){value=uMode>3.5?e.b:e.r;low=vec3(.25,.21,.12);high=vec3(.85,.71,.39);}vec3 color=mix(low,high,value);if(uSpatial>0.){float d=(a.b-.5)*48.;vec3 comparison=mix(vec3(.30,.47,.56),d>0.?vec3(.85,.34,.22):vec3(.30,.58,.72),clamp(abs(d)/12.,0.,1.));color=mix(color,comparison,uSpatial);}if(f.g<.5)color=mix(color,vec3(.34),.7);if(f.b<.5){float hatch=step(.5,fract((vUv.x+vUv.y)*45.));color=mix(vec3(.18),vec3(.40),hatch);}float gx=1.-step(.035,fract(vUv.x*16.));float gy=1.-step(.05,fract(vUv.y*8.));color+=max(gx,gy)*.06;gl_FragColor=vec4(color,uOpacity);}`;
interface Resources {
  geometry: BufferGeometry;
  maps: DataTexture[];
  analysis: DataTexture;
  historyAnalysis: DataTexture[];
  expectation: DataTexture;
  materials: ShaderMaterial[];
  historyMaterials: ShaderMaterial[];
}
function material(
  field: DataTexture,
  analysis: DataTexture,
  expectation: DataTexture,
  mode: number,
) {
  return new ShaderMaterial({
    side: DoubleSide,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uField: { value: field },
      uAnalysis: { value: analysis },
      uExpectation: { value: expectation },
      uMode: { value: mode },
      uSpatial: { value: 0 },
      uOpacity: { value: 0 },
      uUnwrap: { value: 1 },
    },
    vertexShader,
    fragmentShader,
  });
}
const historicalIndices = [3, 6, 8, 10, 11];
/** Additional evidence actors in the existing production Canvas. The hero remains owned by ProductionWorld. */
export function AnalyticalEvidenceWorld() {
  const { size, camera } = useThree(),
    mobile = size.width < 1200;
  const [resources, setResources] = useState<Resources | null>(null);
  const candidate = useRef(Number.NaN);
  /** Candidate nozzle the schematic was built for; -1 = recorded process state. */
  const schematicKey = useRef(Number.NaN);
  const captionPoint = useRef(new Vector3());
  const plates = useRef<(Mesh | null)[]>([]),
    histories = useRef<(Group | null)[]>([]),
    exteriors = useRef<(Group | null)[]>([]),
    next = useRef<Group>(null);
  const schematic = useMemo(createProcessSchematic, []);
  useEffect(() => () => schematic.dispose(), [schematic]);
  useEffect(() => {
    const geometry = evidenceGeometry();
    const population = dataDirector.normalPopulation
      .slice(0, 4)
      .map(createSurfaceTexture);
    const history = historicalIndices.map((i) =>
      createSurfaceTexture(dataDirector.history.records[i].surface),
    );
    const analysis = createAnalysisTexture(dataDirector.hero.surface),
      expectation = createExpectationTexture(
        dataDirector.hero.surface,
        dataDirector.processPrediction,
      );
    const materials = [
      ...population.map((texture) =>
        material(texture, analysis, expectation, 0),
      ),
      material(dataDirector.heroTexture, analysis, expectation, 1),
      material(dataDirector.heroTexture, analysis, expectation, 2),
      material(dataDirector.heroTexture, analysis, expectation, 3),
    ];
    const historyAnalysis = historicalIndices.map((i) =>
      createAnalysisTexture(dataDirector.history.records[i].surface),
    );
    const historyMaterials = history.map((texture, i) =>
      material(texture, historyAnalysis[i], expectation, 0),
    );
    const bundle = {
      geometry,
      maps: [...population, ...history],
      analysis,
      historyAnalysis,
      expectation,
      materials,
      historyMaterials,
    };
    setResources(bundle);
    return () => {
      geometry.dispose();
      for (const entry of [...materials, ...historyMaterials]) entry.dispose();
      for (const texture of [
        ...population,
        ...history,
        ...historyAnalysis,
        analysis,
        bundle.expectation,
      ])
        texture.dispose();
    };
  }, []);
  useFrame(() => {
    if (!resources) return;
    const journey = resolveJourney(experienceClock.progress),
      state = analyticalStateAt(journey.sceneIndex, journey.localProgress);
    const originX = mobile ? 0 : 1.7,
      originY = mobile ? 2.5 : 3.3;
    const { candidateNozzle, candidateFlow } = useExperienceStore.getState();
    const candidateKey = candidateNozzle * 1000 + candidateFlow;
    if (candidate.current !== candidateKey) {
      const scenario = dataDirector.whatIf({
        nozzlePosition: candidateNozzle,
        flowRate: candidateFlow,
      });
      const previous = resources.expectation;
      resources.expectation = createExpectationTexture(
        dataDirector.hero.surface,
        dataDirector.processPrediction,
        scenario,
      );
      for (const entry of [
        ...resources.materials,
        ...resources.historyMaterials,
      ])
        entry.uniforms.uExpectation.value = resources.expectation;
      previous.dispose();
      candidate.current = candidateKey;
    }
    resources.materials[6].uniforms.uMode.value =
      journey.sceneIndex === 5 ? 4 : 3;
    resources.materials.forEach((entry, i) => {
      const plate = plates.current[i];
      if (!plate) return;
      const opacity =
        i < 4
          ? state.population
          : i === 4
            ? state.normal
            : i === 5
              ? state.variation
              : state.process;
      entry.uniforms.uOpacity.value = opacity;
      plate.visible = opacity > 0.001;
      if (i < 4) {
        const spread = 1 - state.alignment;
        plate.position.set(
          originX + (i - 1.5) * spread * (mobile ? 0.35 : 0.6),
          originY + spread * i * 0.15,
          -0.3 - i * 0.06,
        );
        plate.scale.set(mobile ? 0.32 : 0.55, mobile ? 0.24 : 0.5, 1);
      } else {
        const split = Math.max(state.process, state.variation);
        const offset =
          i === 4
            ? -split
            : i === 5
              ? state.variation
              : journey.sceneIndex === 5
                ? 0
                : state.process;
        plate.position.set(
          originX + offset * (mobile ? 0.9 : 1.05),
          originY,
          0,
        );
        plate.scale.set(
          mobile ? 0.28 : lerp(0.55, 0.28, split),
          mobile ? 0.24 : 0.5,
          1,
        );
      }
    });
    resources.historyMaterials.forEach((entry, i) => {
      const actor = histories.current[i];
      if (!actor) return;
      const pose = historyActorPose(i, historicalIndices.length, state, mobile);
      actor.visible = pose.opacity > 0.001;
      actor.position.set(...pose.position);
      actor.scale.set(pose.scaleX, pose.scale, pose.scale);
      entry.uniforms.uSpatial.value = state.spatial;
      entry.uniforms.uUnwrap.value = pose.unwrap;
      entry.uniforms.uOpacity.value = pose.opacity;
      const exterior = exteriors.current[i];
      if (exterior) {
        exterior.visible = pose.exteriorOpacity > 0.001;
        setExteriorOpacity(exterior, pose.exteriorOpacity);
      }
    });
    for (let i = 4; i < resources.materials.length; i++) {
      const plate = plates.current[i],
        key = captionKeys[i];
      if (!plate || !key) continue;
      plate.updateWorldMatrix(true, false);
      captionPoint.current.set(0, 1.08, 0).applyMatrix4(plate.matrixWorld);
      projectCaption(
        key,
        captionPoint.current,
        camera,
        size,
        plate.visible && resources.materials[i].uniforms.uOpacity.value > 0.2,
      );
    }
    const processPlate = plates.current[6];
    schematic.setOpacity(processPlate ? state.nozzle : 0);
    if (processPlate && state.nozzle > 0.001) {
      const key = journey.sceneIndex === 5 ? candidateNozzle : -1;
      if (schematicKey.current !== key) {
        schematicKey.current = key;
        schematic.setGeometry(
          schematicGeometryAt(journey.sceneIndex, candidateNozzle),
        );
      }
      schematic.follow(processPlate, mobile ? 0.75 : 1, mobile);
    }
    if (next.current) {
      next.current.visible = state.nextArrival > 0.001;
      next.current.position.set(lerp(-4, 0, state.nextArrival), 1.1, 0);
      next.current.scale.setScalar(1);
      setExteriorOpacity(next.current, state.nextArrival);
    }
  });
  return (
    <group name="persistent-analytical-evidence">
      {resources &&
        resources.materials.map((entry, i) => (
          <mesh
            key={`plate-${i}`}
            ref={(node) => {
              plates.current[i] = node;
            }}
            geometry={resources.geometry}
            material={entry}
            dispose={null}
            frustumCulled={false}
            name={
              i < 4
                ? `accepted-population-${i}`
                : i === 4
                  ? "normal-mean"
                  : i === 5
                    ? "normal-variation"
                    : "process-expectation"
            }
          />
        ))}
      {resources &&
        resources.historyMaterials.map((entry, i) => (
          <group
            key={`history-${i}`}
            ref={(node) => {
              histories.current[i] = node;
            }}
            name={`history-evidence-${dataDirector.history.records[historicalIndices[i]].id}`}
          >
            <mesh
              geometry={resources.geometry}
              material={entry}
              dispose={null}
              frustumCulled={false}
            />
            <group
              ref={(node) => {
                exteriors.current[i] = node;
              }}
            >
              <NeighbourExterior />
            </group>
          </group>
        ))}
      <primitive object={schematic.group} />
      <group ref={next} visible={false} name="next-illustrative-tyre">
        <NeighbourExterior />
      </group>
    </group>
  );
}
function NeighbourExterior() {
  return (
    <group name="nonhero-procedural-exterior">
      {[-0.33, 0.33].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.16, 0.32, 12, 48]} />
          <meshStandardMaterial
            color="#202729"
            roughness={0.83}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
      <mesh>
        <cylinderGeometry args={[1.47, 1.47, 0.66, 48, 1, true]} />
        <meshStandardMaterial
          color="#252e30"
          roughness={0.78}
          transparent
          opacity={0}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}
