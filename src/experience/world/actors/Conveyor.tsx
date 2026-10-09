import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import { experienceClock } from "../../core/ExperienceClock";
import { resolveJourney } from "../../core/JourneyController";
import { worldAt } from "../WorldDirector";

export function Conveyor() {
  const rollers = useRef<InstancedMesh>(null);
  const seams = useRef<InstancedMesh>(null);
  const lastProgress = useRef(-1);
  const dummy = useMemo(() => new Object3D(), []);
  const updateRollers = (angle: number) => {
    const d = dummy;
    let index = 0;
    for (let i = 0; i < 48; i++) {
      const x = -8 + i * 0.34;
      if (Math.abs(x) < 1.25) continue;
      d.position.set(x, 0.56, 0);
      d.rotation.set(Math.PI / 2, angle, 0);
      d.updateMatrix();
      rollers.current?.setMatrixAt(index, d.matrix);
      d.position.set(
        x + Math.sin(angle) * 0.141,
        0.56 + Math.cos(angle) * 0.141,
        0,
      );
      d.rotation.set(0, 0, -angle);
      d.updateMatrix();
      seams.current?.setMatrixAt(index++, d.matrix);
    }
    if (rollers.current) rollers.current.instanceMatrix.needsUpdate = true;
    if (seams.current) seams.current.instanceMatrix.needsUpdate = true;
  };
  useLayoutEffect(() => updateRollers(0), []);
  useFrame(() => {
    const progress = experienceClock.progress;
    if (progress === lastProgress.current) return;
    lastProgress.current = progress;
    const journey = resolveJourney(progress);
    const world = worldAt(journey.sceneIndex, journey.localProgress);
    updateRollers((world.tyreX + 4) / 0.14);
  });
  return (
    <group name="conveyor">
      <instancedMesh
        ref={rollers}
        args={[undefined, undefined, 40]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.14, 0.14, 3.45, 16]} />
        <meshStandardMaterial
          color="#828a8b"
          metalness={0.78}
          roughness={0.37}
        />
      </instancedMesh>
      <instancedMesh ref={seams} args={[undefined, undefined, 40]}>
        <boxGeometry args={[0.007, 0.005, 3.44]} />
        <meshStandardMaterial
          color="#4d595c"
          metalness={0.6}
          roughness={0.45}
        />
      </instancedMesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[0, 0.47, side * 1.83]} castShadow>
            <boxGeometry args={[16.8, 0.25, 0.17]} />
            <meshStandardMaterial
              color="#434e52"
              roughness={0.57}
              metalness={0.65}
            />
          </mesh>
          <mesh position={[0, 0.61, side * 1.83]}>
            <boxGeometry args={[16.8, 0.026, 0.21]} />
            <meshStandardMaterial
              color="#a2aaac"
              roughness={0.3}
              metalness={0.85}
            />
          </mesh>
          {[-7, -4, 0, 4, 7].map((x) => (
            <group key={x}>
              <mesh position={[x, 0.22, side * 1.65]} castShadow>
                <boxGeometry args={[0.13, 0.6, 0.13]} />
                <meshStandardMaterial
                  color="#414c50"
                  metalness={0.65}
                  roughness={0.6}
                />
              </mesh>
              <mesh position={[x, -0.08, side * 1.65]}>
                <boxGeometry args={[0.33, 0.045, 0.33]} />
                <meshStandardMaterial color="#363f42" roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.59, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.1, 0.13, 12, 64]} />
        <meshStandardMaterial
          color="#555f61"
          metalness={0.75}
          roughness={0.42}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={`guide-${side}`} position={[0, 0, side * 1.63]}>
          <mesh position={[0, 0.65, 0]} castShadow>
            <boxGeometry args={[0.45, 0.13, 0.24]} />
            <meshStandardMaterial
              color="#515e62"
              metalness={0.7}
              roughness={0.45}
            />
          </mesh>
          <mesh position={[0, 0.86, -side * 0.09]} castShadow>
            <cylinderGeometry args={[0.085, 0.085, 0.3, 24]} />
            <meshStandardMaterial
              color="#a0aaa9"
              metalness={0.8}
              roughness={0.35}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
export default Conveyor;
