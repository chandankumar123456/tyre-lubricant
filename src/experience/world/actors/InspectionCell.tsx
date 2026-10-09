export function InspectionCell({
  illumination = 0,
}: {
  illumination?: number;
}) {
  return (
    <group name="inspection-cell">
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}:${z}`} position={[x * 2.05, 1.65, z * 2]} castShadow>
            <boxGeometry args={[0.14, 3.5, 0.14]} />
            <meshStandardMaterial
              color="#394549"
              metalness={0.65}
              roughness={0.5}
            />
          </mesh>
        )),
      )}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 2.05, 3.32, 0]} castShadow>
            <boxGeometry args={[0.2, 0.2, 4.2]} />
            <meshStandardMaterial
              color="#465256"
              metalness={0.7}
              roughness={0.5}
            />
          </mesh>
          <mesh position={[0, 3.32, side * 2]} castShadow>
            <boxGeometry args={[4.2, 0.2, 0.2]} />
            <meshStandardMaterial
              color="#465256"
              metalness={0.7}
              roughness={0.5}
            />
          </mesh>
          <mesh position={[0, 1.74, side * 2.01]}>
            <boxGeometry args={[3.8, 2.75, 0.025]} />
            <meshPhysicalMaterial
              color="#68777b"
              transparent
              opacity={0.035}
              roughness={0.36}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[side * 1.84, 1.7, -1.84]}>
            <boxGeometry args={[0.045, 2.3, 0.065]} />
            <meshStandardMaterial
              color="#abb9bc"
              emissive="#d7e9e8"
              emissiveIntensity={0.15 + illumination * 1.7}
            />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={`roof-${side}`}>
          <mesh position={[side * 1.65, 3.38, 0]} castShadow>
            <boxGeometry args={[0.12, 0.14, 3.85]} />
            <meshStandardMaterial
              color="#354146"
              metalness={0.6}
              roughness={0.6}
            />
          </mesh>
          <mesh position={[side * 1.65, 3.29, 0]}>
            <boxGeometry args={[0.042, 0.025, 2.8]} />
            <meshStandardMaterial
              color="#c5d0d0"
              emissive="#e2eeeb"
              emissiveIntensity={0.15 + illumination * 0.9}
            />
          </mesh>
          <mesh position={[0, 3.38, side * 1.65]} castShadow>
            <boxGeometry args={[3.4, 0.14, 0.12]} />
            <meshStandardMaterial
              color="#354146"
              metalness={0.6}
              roughness={0.6}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[2.13, 1.2, -1.4]}>
        <boxGeometry args={[0.22, 0.47, 0.36]} />
        <meshStandardMaterial color="#58666b" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}
export default InspectionCell;
