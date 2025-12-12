'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import { Mesh } from 'three'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

function FloatingCube({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )
}

function LetterMesh({ letter, position, color }: { letter: string; position: [number, number, number]; color: string }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2
    }
  })

  // Create a simple geometric representation for each letter
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.3, 0.6, 0.1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  )
}

export default function Logo3D() {
  const letters = ['R', '&', 'A', '-', 'D', 'e', 'v']
  const colors = ['#00f0ff', '#b026ff', '#39ff14', '#00f0ff', '#b026ff', '#39ff14', '#00f0ff']
  const positions: [number, number, number][] = [
    [-1.5, 0, 0],
    [-0.9, 0, 0],
    [-0.3, 0, 0],
    [0.3, 0, 0],
    [0.9, 0, 0],
    [1.5, 0, 0],
    [2.1, 0, 0],
  ]

  return (
    <div className="w-full h-[400px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#b026ff" intensity={0.5} />
        
        {letters.map((letter, index) => (
          <LetterMesh
            key={index}
            letter={letter}
            position={positions[index]}
            color={colors[index]}
          />
        ))}
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  )
}
