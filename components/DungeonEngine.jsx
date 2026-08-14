'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls, Billboard, Text } from '@react-three/drei';
import { FLOORS } from '@/lib/mapData';

function PlayerControls({ onInteract }) {
  const controlsRef = useRef();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.code === 'KeyW') moveState.current.forward = true;
      if (key === 's' || e.code === 'KeyS') moveState.current.backward = true;
      if (key === 'a' || e.code === 'KeyA') moveState.current.left = true;
      if (key === 'd' || e.code === 'KeyD') moveState.current.right = true;
      if (key === 'e' || e.code === 'KeyE') onInteract();
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.code === 'KeyW') moveState.current.forward = false;
      if (key === 's' || e.code === 'KeyS') moveState.current.backward = false;
      if (key === 'a' || e.code === 'KeyA') moveState.current.left = false;
      if (key === 'd' || e.code === 'KeyD') moveState.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onInteract]);

  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return;

    const moveSpeed = 4 * delta;

    if (moveState.current.forward) controlsRef.current.moveForward(moveSpeed);
    if (moveState.current.backward) controlsRef.current.moveForward(-moveSpeed);
    if (moveState.current.right) controlsRef.current.moveRight(moveSpeed);
    if (moveState.current.left) controlsRef.current.moveRight(-moveSpeed);
  });

  return <PointerLockControls ref={controlsRef} />;
}

export default function DungeonEngine({ currentFloor, onTriggerEvent }) {
  const currentMap = FLOORS[currentFloor].grid;

  return (
    <div className="w-full h-screen bg-stone-950 relative cursor-crosshair">
      <Canvas camera={{ position: FLOORS[currentFloor].spawn, fov: 75 }}>
        {/* Warm Golden Office Overhead Lighting */}
        <ambientLight intensity={0.6} color="#fef3c7" />
        <pointLight position={[2.5, 3, 3.5]} intensity={2.5} color="#fbbf24" />

        {currentMap.map((row, z) =>
          row.map((tile, x) => {
            // 1 = Office Partition / Wood Panel Walls (Warm Brown)
            if (tile === 1) {
              return (
                <mesh key={`${x}-${z}`} position={[x + 0.5, 1, z + 0.5]}>
                  <boxGeometry args={[1, 2, 1]} />
                  <meshStandardMaterial color="#4a3b32" roughness={0.6} />
                </mesh>
              );
            }
            // 2 = Executive Mahogany Doors with Gold Accents
            if (tile === 2) {
              return (
                <mesh key={`${x}-${z}`} position={[x + 0.5, 1, z + 0.5]}>
                  <boxGeometry args={[0.9, 2, 0.2]} />
                  <meshStandardMaterial color="#78350f" metalness={0.2} roughness={0.3} />
                </mesh>
              );
            }
            // 3 = Elevator (Gold / Brass Text)
            if (tile === 3) {
              return (
                <Billboard key={`${x}-${z}`} position={[x + 0.5, 1, z + 0.5]}>
                  <Text fontSize={0.4} color="#f59e0b">
                    [ELEVATOR]
                  </Text>
                </Billboard>
              );
            }
            // 4 = Computer Terminal (Amber/Gold Screen Glow)
            if (tile === 4) {
              return (
                <Billboard key={`${x}-${z}`} position={[x + 0.5, 0.8, z + 0.5]}>
                  <Text fontSize={0.5} color="#fbbf24">
                    🖥️ TERMINAL
                  </Text>
                </Billboard>
              );
            }
            // 5 = Executive Gold Keycard
            if (tile === 5) {
              return (
                <Billboard key={`${x}-${z}`} position={[x + 0.5, 0.5, z + 0.5]}>
                  <Text fontSize={0.4} color="#d97706">
                    💳 GOLD KEYCARD
                  </Text>
                </Billboard>
              );
            }
            return null;
          })
        )}

        {/* Floor Plane: Dark Slate / Charcoal Carpet */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0, 5]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#18181b" roughness={0.8} />
        </mesh>

        <PlayerControls onInteract={() => onTriggerEvent('INTERACT')} />
      </Canvas>

      {/* Reticle / Crosshair in Brass Gold */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-amber-400 text-xl font-mono select-none">
        +
      </div>
    </div>
  );
}