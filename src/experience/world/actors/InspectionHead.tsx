import { useMemo } from "react";
import { CatmullRomCurve3, Vector3 } from "three";

export function InspectionHead({
  deployment = 0,
  illumination = 0,
}: {
  deployment?: number;
  illumination?: number;
}) {
  const cable = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(0.12, -0.3, 0),
        new Vector3(0.15, -0.05, 0.04),
        new Vector3(0.13, 0.25, 0.03),
        new Vector3(0.14, 0.6, 0),
      ]),
    [],
  );
  return (
    <group
      name="inspection-head"
      position={[0, -0.8 + Math.max(0, Math.min(1, deployment)) * 1.05, 0]}
    >
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.07, 0.9, 24]} />
        <meshStandardMaterial
          color="#adb4b4"
          metalness={0.85}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, 0.59, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.11, 0.12, 32]} />
        <meshStandardMaterial
          color="#606b6e"
          metalness={0.8}
          roughness={0.36}
        />
      </mesh>
      <mesh position={[0, 0.71, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.16, 0.16, 48]} />
        <meshStandardMaterial
          color="#8e989a"
          metalness={0.83}
          roughness={0.26}
        />
      </mesh>
      <mesh position={[0, 0.827, 0]}>
        <cylinderGeometry args={[0.14, 0.18, 0.08, 48]} />
        <meshStandardMaterial
          color="#1c292d"
          metalness={0.45}
          roughness={0.12}
        />
      </mesh>
      <mesh position={[0, 0.885, 0]}>
        <sphereGeometry
          args={[0.137, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshPhysicalMaterial
          color="#25363c"
          metalness={0.45}
          roughness={0.08}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, 0.795, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.177, 0.013, 8, 48]} />
        <meshStandardMaterial
          color="#e1e5e1"
          emissive="#ebf6f4"
          emissiveIntensity={illumination * 1.7}
          roughness={0.4}
        />
      </mesh>
      <mesh>
        <tubeGeometry args={[cable, 24, 0.016, 8, false]} />
        <meshStandardMaterial color="#202a2d" roughness={0.8} />
      </mesh>
      <mesh position={[0.17, 0.715, 0]}>
        <boxGeometry args={[0.011, 0.035, 0.018]} />
        <meshStandardMaterial color="#d2b778" roughness={0.7} />
      </mesh>
    </group>
  );
}
export default InspectionHead;
