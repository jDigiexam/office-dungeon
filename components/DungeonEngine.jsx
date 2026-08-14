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
      if (e.code === 'KeyW') moveState.current.forward = true;
      if (e.code === 'KeyS') moveState.current.backward = true;
      if (e.code === 'KeyA') moveState.current.left = true;
      if (e.code === 'KeyD') moveState.current.right = true;
      if (e.code === 'KeyE') onInteract();
    };

    const handleKeyUp = (e) => {
      if (e.code === 'KeyW') moveState.current.forward = false;
      if (e.code === 'KeyS') moveState.current.backward = false;
      if (e.code === 'KeyA') moveState.current.left = false;
      if (e.code === 'KeyD') moveState.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onInteract]);

  useFrame((state, delta) => {
    if (!controlsRef.current?.isLocked) return;

    // Force classic Doom lock: set pitch (x-axis rotation) to 0
    state.camera.rotation.x = 0;

    const speed = 4 * delta;
    const camera = state.camera;

    if (moveState.current.forward) camera.moveForward(speed);
    if (moveState.current.backward) camera.moveForward(-speed);
    if (moveState.current.left) camera.moveRight(-speed);
    if (moveState.current.right) camera.moveRight(speed);
  });

  return <PointerLockControls ref={controlsRef} />;
}

export default function DungeonEngine({ currentFloor, onTriggerEvent }) {
  const currentMap = FLOORS[currentFloor].grid;

  return (
    <div className="w-full h-screen bg-black relative cursor-crosshair">
      <Canvas camera={{ position: FLOORS[currentFloor].spawn, fov: 75 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {currentMap.map((row, z) =>
          row.map((tile, x) => {
            if (tile === 1) {
              return (
                <mesh key={`${x}-${z}`} position={[x + 0.5, 1, z + 0.5]}>
                  <boxGeometry args={[1, 2, 1]} />
                  <meshStandardMaterial color="#334155" />
                </mesh>
              );
            }
            if (tile === 2) {
              return (
                <mesh key={`${x}-${z}`} position={[x + 0.5, 1, z + 0.5]}>
                  <boxGeometry args={[0.9, 2, 0.2]} />
                  <meshStandardMaterial color="#dc2626" />
                </mesh>
              );
            }
            if (tile === 3) {
              return (
                <Billboard key={`${x}-${z}`} position={[x + 0.5, 1, z + 0.5]}>
                  <Text fontSize={0.4} color="yellow">
                    [ELEVATOR]
                  </Text>
                </Billboard>
              );
            }
            if (tile === 4) {
              return (
                <Billboard key={`${x}-${z}`} position={[x + 0.5, 0.8, z + 0.5]}>
                  <Text fontSize={0.5} color="#22c55e">
                    🖥️ TERMINAL
                  </Text>
                </Billboard>
              );
            }
            if (tile === 5) {
              return (
                <Billboard key={`${x}-${z}`} position={[x + 0.5, 0.5, z + 0.5]}>
                  <Text fontSize={0.4} color="#3b82f6">
                    💳 KEYCARD
                  </Text>
                </Billboard>
              );
            }
            return null;
          })
        )}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0, 5]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        <PlayerControls onInteract={() => onTriggerEvent('INTERACT')} />
      </Canvas>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-green-500 text-xl font-mono">
        +
      </div>
    </div>
  );
}