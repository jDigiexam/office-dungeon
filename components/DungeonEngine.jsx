'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls, Billboard, Text } from '@react-three/drei';
import { FLOORS } from '@/lib/mapData';

// Animated 3D Floating Gold Keycard with High-Contrast Icon
function KeycardMesh({ position }) {
  const cardRef = useRef();

  useFrame((_, delta) => {
    if (cardRef.current) {
      cardRef.current.rotation.y += delta * 1.8; // Gentle rotation
    }
  });

  return (
    <group position={position}>
      {/* Rotating Metallic Card */}
      <mesh ref={cardRef} position={[0, 0.5, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.35, 0.22, 0.02]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.1}
          emissive="#d97706"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Floating High-Contrast Badge Icon */}
      <Billboard position={[0, 0.9, 0]}>
        <Text
          fontSize={0.25}
          color="#fef08a"
          outlineWidth={0.03}
          outlineColor="#000000"
          font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
        >
          💳 KEYCARD
        </Text>
      </Billboard>
    </group>
  );
}

// 3D Terminal Console
function TerminalMesh({ position }) {
  return (
    <group position={position}>
      {/* Terminal Base */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial color="#27272a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Screen Monitor */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.5, 0.35, 0.1]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} />
      </mesh>
      {/* High-Contrast Icon Label */}
      <Billboard position={[0, 1.3, 0]}>
        <Text
          fontSize={0.25}
          color="#fbbf24"
          outlineWidth={0.03}
          outlineColor="#000000"
          font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
        >
          🖥️ TERMINAL
        </Text>
      </Billboard>
    </group>
  );
}

function PlayerControls({ grid, onInteract }) {
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

  useFrame((state, delta) => {
    if (!controlsRef.current?.isLocked) return;

    const camera = state.camera;
    const oldX = camera.position.x;
    const oldZ = camera.position.z;
    const moveSpeed = 4 * delta;

    if (moveState.current.forward) controlsRef.current.moveForward(moveSpeed);
    if (moveState.current.backward) controlsRef.current.moveForward(-moveSpeed);
    if (moveState.current.right) controlsRef.current.moveRight(moveSpeed);
    if (moveState.current.left) controlsRef.current.moveRight(-moveSpeed);

    const newX = camera.position.x;
    const newZ = camera.position.z;
    const radius = 0.25;

    const isSolidTile = (x, z) => {
      const gx = Math.floor(x);
      const gz = Math.floor(z);
      if (gz < 0 || gz >= grid.length || gx < 0 || gx >= grid[0].length) return true;
      const tile = grid[gz][gx];
      return tile === 1 || tile === 2;
    };

    const collidesAt = (x, z) => {
      return (
        isSolidTile(x - radius, z - radius) ||
        isSolidTile(x + radius, z - radius) ||
        isSolidTile(x - radius, z + radius) ||
        isSolidTile(x + radius, z + radius)
      );
    };

    camera.position.x = newX;
    camera.position.z = oldZ;
    if (collidesAt(camera.position.x, camera.position.z)) {
      camera.position.x = oldX;
    }

    camera.position.z = newZ;
    if (collidesAt(camera.position.x, camera.position.z)) {
      camera.position.z = oldZ;
    }
  });

  return <PointerLockControls ref={controlsRef} />;
}

export default function DungeonEngine({ currentFloor, onTriggerEvent }) {
  const currentMap = FLOORS[currentFloor].grid;

  return (
    <div className="w-full h-screen bg-stone-950 relative cursor-crosshair">
      <Canvas camera={{ position: FLOORS[currentFloor].spawn, fov: 75 }}>
        {/* High-Contrast Dual Lighting Setup */}
        <ambientLight intensity={0.7} color="#ffffff" />
        <pointLight position={[2.5, 1.8, 3.5]} intensity={3} color="#fef08a" />

        {currentMap.map((row, z) =>
          row.map((tile, x) => {
            // 1 = High-Contrast Wood Partition Walls with Gold Trim
            if (tile === 1) {
              return (
                <group key={`${x}-${z}`} position={[x + 0.5, 1, z + 0.5]}>
                  {/* Main Wall Block */}
                  <mesh>
                    <boxGeometry args={[1, 2, 1]} />
                    <meshStandardMaterial color="#582f0e" roughness={0.4} />
                  </mesh>
                  {/* High-Visibility Baseboard Accent */}
                  <mesh position={[0, -0.9, 0]}>
                    <boxGeometry args={[1.02, 0.2, 1.02]} />
                    <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.2} />
                  </mesh>
                </group>
              );
            }
            // 2 = High-Contrast Crimson Doors with Brass Trim
            if (tile === 2) {
              return (
                <group key={`${x}-${z}`} position={[x + 0.5, 1, z + 0.5]}>
                  <mesh>
                    <boxGeometry args={[0.9, 2, 0.15]} />
                    <meshStandardMaterial color="#dc2626" roughness={0.3} />
                  </mesh>
                  {/* Gold Handle Trim */}
                  <mesh position={[0.3, 0, 0.1]}>
                    <boxGeometry args={[0.08, 0.3, 0.08]} />
                    <meshStandardMaterial color="#fbbf24" metalness={0.8} />
                  </mesh>
                </group>
              );
            }
            // 3 = Elevator Zone
            if (tile === 3) {
              return (
                <Billboard key={`${x}-${z}`} position={[x + 0.5, 1, z + 0.5]}>
                  <Text
                    fontSize={0.35}
                    color="#f59e0b"
                    outlineWidth={0.03}
                    outlineColor="#000000"
                    font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
                  >
                    🛗 ELEVATOR
                  </Text>
                </Billboard>
              );
            }
            // 4 = 3D Interactive Terminal
            if (tile === 4) {
              return <TerminalMesh key={`${x}-${z}`} position={[x + 0.5, 0, z + 0.5]} />;
            }
            // 5 = 3D Animated Gold Keycard
            if (tile === 5) {
              return <KeycardMesh key={`${x}-${z}`} position={[x + 0.5, 0, z + 0.5]} />;
            }
            return null;
          })
        )}

        {/* Floor Plane: Dark Slate (High contrast against white ceiling and brown walls) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0, 10]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* Ceiling Plane: Off-White Acoustic Tiles (Provides spatial depth & orientation) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[10, 2, 10]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
        </mesh>

        <PlayerControls grid={currentMap} onInteract={() => onTriggerEvent('INTERACT')} />
      </Canvas>

      {/* High-Contrast Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-amber-300 text-2xl font-bold select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
        +
      </div>
    </div>
  );
}