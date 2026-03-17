import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  
  const points = useMemo(() => {
    const pts: { pos: THREE.Vector3; color: string }[] = [];
    for (let i = 0; i < 40; i++) {
      const t = i * 0.3;
      const x1 = Math.cos(t) * 1.2;
      const z1 = Math.sin(t) * 1.2;
      const x2 = Math.cos(t + Math.PI) * 1.2;
      const z2 = Math.sin(t + Math.PI) * 1.2;
      const y = (i - 20) * 0.2;
      pts.push({ pos: new THREE.Vector3(x1, y, z1), color: '#0EA5E9' });
      pts.push({ pos: new THREE.Vector3(x2, y, z2), color: '#10B981' });
    }
    return pts;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {points.map((pt, i) => (
        <mesh key={i} position={pt.pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={pt.color} emissive={pt.color} emissiveIntensity={0.5} />
        </mesh>
      ))}
      {Array.from({ length: 20 }).map((_, i) => {
        const t = i * 0.6;
        const y = (i - 10) * 0.4;
        const x1 = Math.cos(t) * 1.2;
        const z1 = Math.sin(t) * 1.2;
        const x2 = Math.cos(t + Math.PI) * 1.2;
        const z2 = Math.sin(t + Math.PI) * 1.2;
        const mid = new THREE.Vector3((x1 + x2) / 2, y, (z1 + z2) / 2);
        const length = new THREE.Vector3(x2 - x1, 0, z2 - z1).length();
        const angle = Math.atan2(z2 - z1, x2 - x1);
        return (
          <mesh key={`bar-${i}`} position={mid} rotation={[0, -angle, 0]}>
            <boxGeometry args={[length, 0.03, 0.03]} />
            <meshStandardMaterial color="#6366F1" opacity={0.6} transparent />
          </mesh>
        );
      })}
    </group>
  );
}

function FloatingCapsule({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={position}>
        <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
        <MeshTransmissionMaterial
          backside
          thickness={0.5}
          chromaticAberration={0.2}
          anisotropy={0.3}
          roughness={0.1}
          color="#0EA5E9"
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#0EA5E9" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#10B981" />
        <DNAHelix />
        <FloatingCapsule position={[3, 1.5, -2]} />
        <FloatingCapsule position={[-3, -1.5, -1]} />
      </Canvas>
    </div>
  );
}
