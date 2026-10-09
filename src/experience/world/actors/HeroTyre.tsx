import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { createRubberMicrotexture } from "./rubberMaterial";
import {
  CatmullRomCurve3,
  ExtrudeGeometry,
  InstancedMesh,
  Object3D,
  Shape,
  Vector2,
  Vector3,
} from "three";
/** Independent unbranded procedural hero; outer body and measurement data remain separate. */
export function HeroTyre({
  rotation = 0,
  detail = "high",
}: {
  rotation?: number;
  detail?: "high" | "low";
}) {
  const rubber = useMemo(createRubberMicrotexture, []);
  useEffect(() => () => rubber.dispose(), [rubber]);
  const tread = useRef<InstancedMesh>(null),
    mould = useRef<InstancedMesh>(null);
  const carcass = useMemo(
    () =>
      new CatmullRomCurve3(
        [
          [0.82, -0.29],
          [0.86, -0.36],
          [1.02, -0.38],
          [1.23, -0.34],
          [1.42, -0.22],
          [1.47, -0.12],
          [1.47, 0.12],
          [1.42, 0.22],
          [1.23, 0.34],
          [1.02, 0.38],
          [0.86, 0.36],
          [0.82, 0.29],
          [0.84, 0.23],
          [1.03, 0.25],
          [1.25, 0.19],
          [1.36, 0.1],
          [1.36, -0.1],
          [1.25, -0.19],
          [1.03, -0.25],
          [0.84, -0.23],
          [0.82, -0.29],
        ].map(([r, y]) => new Vector3(r, y, 0)),
        false,
        "centripetal",
      )
        .getPoints(detail === "high" ? 240 : 120)
        .map((p) => new Vector2(p.x, p.y)),
    [detail],
  );
  const treadGeometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-0.046, -0.031);
    shape.lineTo(0.044, -0.027);
    shape.lineTo(0.049, 0.027);
    shape.lineTo(-0.04, 0.033);
    shape.closePath();
    const geometry = new ExtrudeGeometry(shape, {
      depth: 0.032,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.004,
      bevelThickness: 0.004,
      curveSegments: 1,
    });
    geometry.translate(0, 0, -0.012);
    return geometry;
  }, []);
  useLayoutEffect(() => {
    const d = new Object3D();
    for (let row = 0; row < 4; row++)
      for (let i = 0; i < 72; i++) {
        const a = ((i + (row % 2) * 0.45) / 72) * Math.PI * 2;
        d.position.set(
          Math.sin(a) * 1.477,
          (row - 1.5) * 0.085,
          Math.cos(a) * 1.477,
        );
        d.rotation.set(0, a, row % 2 ? -0.12 : 0.12);
        d.scale.set(1, 1, 1);
        d.updateMatrix();
        tread.current?.setMatrixAt(row * 72 + i, d.matrix);
      }
    if (tread.current) tread.current.instanceMatrix.needsUpdate = true;
    let k = 0;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        d.position.set(Math.sin(a) * 1.24, side * 0.322, Math.cos(a) * 1.24);
        d.rotation.set(0, a, 0);
        d.scale.set(0.009, 0.004, 0.065);
        d.updateMatrix();
        mould.current?.setMatrixAt(k++, d.matrix);
      }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        for (let j = 0; j < 3; j++) {
          const lateral = (j - 1) * 0.02;
          d.position.set(
            Math.sin(a) * 1.075 + Math.cos(a) * lateral,
            side * 0.375,
            Math.cos(a) * 1.075 - Math.sin(a) * lateral,
          );
          d.rotation.set(0, a, 0);
          d.scale.set(0.009, 0.006, 0.024 + ((i + j) % 3) * 0.006);
          d.updateMatrix();
          mould.current?.setMatrixAt(k++, d.matrix);
        }
      }
    }
    if (mould.current) mould.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group rotation={[0, rotation, 0]} name="persistent-hero-tyre">
      <mesh castShadow receiveShadow>
        <latheGeometry args={[carcass, detail === "high" ? 192 : 96]} />
        <meshStandardMaterial
          color="#242827"
          roughness={0.86}
          metalness={0.015}
          bumpMap={rubber}
          bumpScale={0.007}
        />
      </mesh>
      <instancedMesh
        ref={tread}
        args={[undefined, undefined, 288]}
        castShadow
        receiveShadow
      >
        <primitive object={treadGeometry} attach="geometry" />
        <meshStandardMaterial color="#282c2b" roughness={0.92} />
      </instancedMesh>
      <instancedMesh ref={mould} args={[undefined, undefined, 144]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#333735" roughness={0.94} />
      </instancedMesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          {[0.835, 0.875, 1.06, 1.2].map((r, i) => (
            <mesh
              key={r}
              position={[0, side * (i < 2 ? 0.325 : 0.365 - i * 0.016), 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <torusGeometry
                args={[
                  r,
                  i === 0 ? 0.023 : 0.006,
                  6,
                  detail === "high" ? 128 : 64,
                ]}
              />
              <meshStandardMaterial
                color={i === 0 ? "#303534" : "#323634"}
                roughness={0.88}
              />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.365, 1.01]}>
        <boxGeometry args={[0.055, 0.004, 0.018]} />
        <meshStandardMaterial color="#aba792" roughness={1} />
      </mesh>
    </group>
  );
}
export default HeroTyre;
