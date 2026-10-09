export function ProcessGeometry({ offset = 0 }: { offset?: number }) {
  return (
    <group
      name="illustrative-spray-geometry"
      position={[offset, 2.35, 0]}
      rotation={[0, 0, 0.22]}
    >
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.19, 0.55, 0.19]} />
        <meshStandardMaterial
          color="#859292"
          metalness={0.75}
          roughness={0.35}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.11, 0.065, 0.2, 24]} />
        <meshStandardMaterial
          color="#a39d80"
          metalness={0.76}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, -0.13, 0]}>
        <cylinderGeometry args={[0.063, 0.035, 0.08, 24]} />
        <meshStandardMaterial color="#39474c" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.22, 0.54, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.45, 16]} />
        <meshStandardMaterial color="#39474c" roughness={0.8} />
      </mesh>
    </group>
  );
}
export default ProcessGeometry;
