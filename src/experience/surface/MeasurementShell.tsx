import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  DoubleSide,
  Vector2,
  Vector3,
} from "three";
import { curvedPosition, flatPosition } from "./surfaceCoordinates";
import {
  createAnalysisTexture,
  createExpectationTexture,
} from "./SurfaceTextures";
import { dataDirector } from "../core/DataDirector";
import { segment } from "../core/ExperienceClock";
import { useExperienceStore } from "../state/experienceStore";
import { projectCaption } from "../core/ProjectionAnnotations";
import {
  hasAnnotation,
  setAnnotationWidth,
} from "../core/AnnotationRegistry";
import type { SurfaceField } from "./SurfaceField";
import { experienceClock } from "../core/ExperienceClock";
import { resolveJourney } from "../core/JourneyController";
import { worldAt } from "../world/WorldDirector";
const evidence = dataDirector.evidenceLocation;
export function MeasurementShell({ field }: { field: SurfaceField }) {
  const { size, camera } = useThree();
  const labelPoint = useRef(new Vector3());
  const edgePoint = useRef(new Vector3());
  const mesh = useRef<import("three").Mesh>(null);
  const geometry = useMemo(() => {
    const g = new BufferGeometry(),
      curved: number[] = [],
      flat: number[] = [],
      uv: number[] = [],
      indices: number[] = [];
    const w = 128,
      h = 48;
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
  }, []);
  const texture = dataDirector.heroTexture;
  const candidate = useExperienceStore((s) => s.candidateNozzle);
  const candidateFlow = useExperienceStore((s) => s.candidateFlow);
  const analysis = useMemo(() => createAnalysisTexture(field), [field]);
  const expected = useMemo(
    () =>
      createExpectationTexture(
        field,
        dataDirector.processPrediction,
        dataDirector.whatIf({
          nozzlePosition: candidate,
          flowRate: candidateFlow,
        }),
      ),
    [field, candidate, candidateFlow],
  );
  const material = useMemo(
    () =>
      new ShaderMaterial({
        side: DoubleSide,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uField: { value: texture },
          uAnalysis: { value: analysis },
          uExpected: { value: expected },
          uNormal: { value: 0 },
          uResidual: { value: 0 },
          uScenario: { value: 0 },
          uHeightScale: { value: 1 },
          uUnwrap: { value: 0 },
          uCoverage: { value: 0 },
          uOpacity: { value: 0 },
          uMode: { value: 0 },
          uMapOffset: { value: 1.7 },
          uMapScale: { value: 1 },
          uMapY: { value: 0 },
          uMarker: {
            value: new Vector2(evidence.u, evidence.v),
          },
        },
        vertexShader: `attribute vec3 aFlat;uniform float uUnwrap;uniform float uMapOffset;uniform float uMapScale;uniform float uMapY;uniform float uHeightScale;varying vec2 vUv;void main(){vUv=uv;float front=clamp((uUnwrap*1.2-uv.x)/.2,0.,1.);front=front*front*(3.-2.*front);vec3 planar=vec3(aFlat.x*uMapScale+uMapOffset,aFlat.y*uHeightScale+uMapY,aFlat.z);vec3 p=mix(position,planar,front);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
        fragmentShader: `uniform sampler2D uField;uniform sampler2D uAnalysis;uniform sampler2D uExpected;uniform float uNormal;uniform float uResidual;uniform float uScenario;uniform float uCoverage;uniform float uOpacity;uniform float uMode;uniform vec2 uMarker;varying vec2 vUv;void main(){vec4 f=texture2D(uField,vUv);if(vUv.x>uCoverage)discard;float o=f.r;vec3 col=mix(vec3(.09,.18,.22),vec3(.61,.77,.78),o);if(uMode>0.5&&uMode<1.5)col=mix(vec3(.24,.25,.27),vec3(.48,.72,.79),f.g);if(uMode>1.5&&uMode<2.5)col=mix(vec3(.26,.27,.29),vec3(.59,.72,.69),f.b);vec4 a=texture2D(uAnalysis,vUv);vec4 e=texture2D(uExpected,vUv);float d=(a.b-.5)*2.;vec3 deviation=mix(vec3(.26,.36,.39),d>0.?vec3(.80,.38,.26):vec3(.30,.58,.72),clamp(abs(d)*2.,0.,1.));col=mix(col,deviation,uNormal);float r=mix(a.a,e.a,uScenario);vec3 residual=mix(vec3(.25,.34,.33),r>.5?vec3(.84,.49,.29):vec3(.34,.59,.70),clamp(abs(r-.5)*4.,0.,1.));col=mix(col,residual,uResidual);if(f.g<.5)col=mix(col,vec3(.34),.7);if(f.b<.5){float hatch=step(.45,fract((vUv.x+vUv.y)*55.));col=mix(vec3(.15),vec3(.5),hatch);}float gx=1.-step(.028,fract(vUv.x*24.));float gy=1.-step(.04,fract(vUv.y*12.));col+=max(gx,gy)*.075;float mark=1.-smoothstep(.016,.023,length((vUv-uMarker)*vec2(1.,.65)));col=mix(col,vec3(.83,.60,.30),mark*.75);gl_FragColor=vec4(col,uOpacity);}`,
      }),
    [texture, analysis, expected],
  );
  // Candidate controls replace only their expectation texture and material.
  // Keep the canonical geometry and analysis texture alive for their own lifetimes.
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => analysis.dispose(), [analysis]);
  useEffect(() => () => expected.dispose(), [expected]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    const j = resolveJourney(experienceClock.progress),
      s = worldAt(j.sceneIndex, j.localProgress);
    const spread =
      j.sceneIndex === 5
        ? segment(j.localProgress, 0.02, 0.16) *
          (1 - segment(j.localProgress, 0.92, 0.99))
        : 0;
    material.uniforms.uNormal.value =
      j.sceneIndex === 3
        ? segment(j.localProgress, 0.72, 0.82)
        : j.sceneIndex > 3
          ? 1
          : 0;
    material.uniforms.uResidual.value =
      j.sceneIndex === 4
        ? segment(j.localProgress, 0.73, 0.84)
        : j.sceneIndex === 5
          ? 1
          : 0;
    material.uniforms.uScenario.value =
      j.sceneIndex === 5
        ? segment(j.localProgress, 0.74, 0.78) *
          (1 - segment(j.localProgress, 0.84, 0.9))
        : 0;
    material.uniforms.uMapOffset.value =
      size.width < 1200 ? 0 : 1.7 + 2.6 * spread;
    const compress =
      j.sceneIndex === 3
        ? segment(j.localProgress, 0, 0.1)
        : j.sceneIndex > 3
          ? 1
          : 0;
    material.uniforms.uHeightScale.value =
      size.width < 1200
        ? (1 - 0.5 * compress) * (1 - spread) + 0.25 * spread
        : 1 - 0.7 * spread;
    material.uniforms.uMapScale.value =
      (size.width < 1200 ? 0.58 : 1) *
      (1 - (size.width < 1200 ? 0.2 : 0.75) * spread);
    material.uniforms.uMapY.value =
      (size.width < 700
        ? 0.42
        : size.width < 1200
          ? 0.72 - 0.4 * compress
          : 0) +
      spread * (size.width < 700 ? -0.2 : size.width < 1200 ? -0.4 : 1.3);
    material.uniforms.uUnwrap.value = s.unwrap;
    material.uniforms.uCoverage.value = s.acquisition;
    material.uniforms.uOpacity.value = s.surface;
    material.uniforms.uMode.value =
      j.sceneIndex === 2 && j.localProgress >= 0.89 && j.localProgress < 0.92
        ? 1
        : j.sceneIndex === 2 &&
            j.localProgress >= 0.92 &&
            j.localProgress < 0.97
          ? 2
          : 0;
    if (mesh.current) {
      mesh.current.visible = s.surface > 0.001;
      mesh.current.position.set(s.tyreX, 1.1, 0);
      mesh.current.rotation.y = s.rotation * (1 - s.unwrap);
      mesh.current.updateWorldMatrix(true, false);
      labelPoint.current
        .set(
          material.uniforms.uMapOffset.value,
          material.uniforms.uMapY.value +
            material.uniforms.uHeightScale.value +
            (j.sceneIndex === 5 && size.width < 1200 ? 0.05 : 0.07),
          0,
        )
        .applyMatrix4(mesh.current.matrixWorld);
      projectCaption(
        "caption-hero-measurement-shell",
        labelPoint.current,
        camera,
        size,
        s.unwrap > 0.98 && s.surface > 0.2,
      );
      if (hasAnnotation("deviation-legend")) {
        labelPoint.current
          .set(
            material.uniforms.uMapOffset.value,
            material.uniforms.uMapY.value -
              material.uniforms.uHeightScale.value +
              (size.width < 700 ? 0.04 : size.width < 1200 ? 0.02 : -0.04),
            0,
          )
          .applyMatrix4(mesh.current.matrixWorld);
        projectCaption(
          "deviation-legend",
          labelPoint.current,
          camera,
          size,
          s.unwrap > 0.98 && s.surface > 0.2,
        );
        edgePoint.current
          .set(
            material.uniforms.uMapOffset.value -
              3 * material.uniforms.uMapScale.value,
            material.uniforms.uMapY.value -
              material.uniforms.uHeightScale.value,
            0,
          )
          .applyMatrix4(mesh.current.matrixWorld)
          .project(camera);
        const left = ((edgePoint.current.x + 1) * size.width) / 2;
        edgePoint.current
          .set(
            material.uniforms.uMapOffset.value +
              3 * material.uniforms.uMapScale.value,
            material.uniforms.uMapY.value -
              material.uniforms.uHeightScale.value,
            0,
          )
          .applyMatrix4(mesh.current.matrixWorld)
          .project(camera);
        setAnnotationWidth(
          "deviation-legend",
          Math.abs(((edgePoint.current.x + 1) * size.width) / 2 - left),
        );
      }
    }
  });
  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      name="hero-measurement-shell"
    />
  );
}
