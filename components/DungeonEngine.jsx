'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

// 1. Pure 3D Keycard Mesh (Rotating Emissive Red Access Card)
function KeycardMesh({ position }) {
  const cardRef = useRef();

  useFrame((_, delta) => {
    if (cardRef.current) {
      cardRef.current.rotation.y += delta * 2.5;
    }
  });

  return (
    <group position={position}>
      {/* Pedestal */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.4, 8]} />
        <meshStandardMaterial color="#27272a" roughness={0.8} />
      </mesh>
      {/* Floating Rotating Red Keycard */}
      <mesh ref={cardRef} position={[0, 0.65, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.35, 0.22, 0.03]} />
        <meshStandardMaterial
          color="#dc2626"
          emissive="#ef4444"
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// 2. Pure 3D Terminal Console
function TerminalMesh({ position }) {
  return (
    <group position={position}>
      {/* Computer Tower & Desk */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.6, 0.7, 0.5]} />
        <meshStandardMaterial color="#18181b" roughness={0.7} />
      </mesh>
      {/* Glowing CRT Monitor */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.45, 0.35, 0.3]} />
        <meshStandardMaterial color="#09090b" roughness={0.5} />
      </mesh>
      {/* CRT Screen Glow */}
      <mesh position={[0, 0.85, 0.16]}>
        <planeGeometry args={[0.38, 0.28]} />
        <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

// 3. Pure 3D Wall Lamp Sconce
function WallLampMesh({ position }) {
  return (
    <group position={position}>
      {/* Industrial Metal Fixture */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.2, 0.25, 0.15]} />
        <meshStandardMaterial color="#52525b" metalness={0.8} />
      </mesh>
      {/* Glowing Bulb Shade */}
      <mesh position={[0, 1.0, 0.1]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={1} />
      </mesh>
      <pointLight position={[0, 1.0, 0.25]} intensity={4} distance={6} color="#fbbf24" />
    </group>
  );
}

// 4. Pure 3D Elevator Frame & Indicator
function ElevatorMesh({ position }) {
  return (
    <group position={position}>
      {/* Elevator Frame */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.95, 1.55, 0.1]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Arrow Indicator Light */}
      <mesh position={[0, 1.5, 0.08]}>
        <boxGeometry args={[0.2, 0.1, 0.02]} />
        <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

// Player Controls & Interaction Raycaster
function PlayerControls({ grid, onInteract }) {
  const controlsRef = useRef();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const { camera } = useThree();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.code === 'KeyW') moveState.current.forward = true;
      if (key === 's' || e.code === 'KeyS') moveState.current.backward = true;
      if (key === 'a' || e.code === 'KeyA') moveState.current.left = true;
      if (key === 'd' || e.code === 'KeyD') moveState.current.right = true;

      // Interaction Key 'E' -> Raycast Forward
      if (key === 'e' || e.code === 'KeyE') {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);

        // Check target tile in front of camera
        const targetX = Math.floor(camera.position.x + dir.x * 1.3);
        const targetZ = Math.floor(camera.position.z + dir.z * 1.3);

        if (
          targetZ >= 0 &&
          targetZ < grid.length &&
          targetX >= 0 &&
          targetX < grid[0].length
        ) {
          const tile = grid[targetZ][targetX];
          onInteract(tile, targetX, targetZ);
        }
      }
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
  }, [camera, grid, onInteract]);

  useFrame((state, delta) => {
    if (!controlsRef.current?.isLocked) return;

    state.camera.rotation.x = 0; // Classic DOOM camera lock

    const oldX = camera.position.x;
    const oldZ = camera.position.z;
    const moveSpeed = 4.5 * delta;

    if (moveState.current.forward) controlsRef.current.moveForward(moveSpeed);
    if (moveState.current.backward) controlsRef.current.moveForward(-moveSpeed);
    if (moveState.current.right) controlsRef.current.moveRight(moveSpeed);
    if (moveState.current.left) controlsRef.current.moveRight(-moveSpeed);

    const newX = camera.position.x;
    const newZ = camera.position.z;
    const radius = 0.22;

    const isSolidTile = (x, z) => {
      const gx = Math.floor(x);
      const gz = Math.floor(z);
      if (gz < 0 || gz >= grid.length || gx < 0 || gx >= grid[0].length) return true;
      const tile = grid[gz][gx];
      return tile === 1 || tile === 2; // Walls & Closed Doors block movement
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

export default function DungeonEngine({ currentFloor, grid, onInteract }) {
  return (
    <div className="w-full h-screen bg-black relative cursor-crosshair">
      <Canvas
        camera={{ position: [2.5, 0.8, 2.5], fov: 80 }}
        gl={{ antialias: false }}
        style={{ imageRendering: 'pixelated' }}
      >
        <fog attach="fog" args={['#000000', 1, 9]} />
        <ambientLight intensity={0.15} color="#ffffff" />

        {grid.map((row, z) =>
          row.map((tile, x) => {
            // 1 = Dark Industrial Wall
            if (tile === 1) {
              return (
                <mesh key={`${x}-${z}`} position={[x + 0.5, 0.8, z + 0.5]}>
                  <boxGeometry args={[1, 1.6, 1]} />
                  <meshStandardMaterial color="#3f3f46" roughness={0.9} />
                </mesh>
              );
            }
            // 2 = Heavy Steel Vault Door
            if (tile === 2) {
              return (
                <group key={`${x}-${z}`} position={[x + 0.5, 0.8, z + 0.5]}>
                  <mesh>
                    <boxGeometry args={[0.9, 1.6, 0.15]} />
                    <meshStandardMaterial color="#7f1d1d" roughness={0.5} emissive="#450a0a" emissiveIntensity={0.5} />
                  </mesh>
                  {/* Door Keycard Slot Light */}
                  <mesh position={[0.35, 0, 0.09]}>
                    <boxGeometry args={[0.08, 0.15, 0.02]} />
                    <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1} />
                  </mesh>
                </group>
              );
            }
            // 3 = 3D Elevator Frame
            if (tile === 3) {
              return <ElevatorMesh key={`${x}-${z}`} position={[x + 0.5, 0, z + 0.5]} />;
            }
            // 4 = 3D Terminal Console
            if (tile === 4) {
              return <TerminalMesh key={`${x}-${z}`} position={[x + 0.5, 0, z + 0.5]} />;
            }
            // 5 = 3D Keycard
            if (tile === 5) {
              return <KeycardMesh key={`${x}-${z}`} position={[x + 0.5, 0, z + 0.5]} />;
            }
            // 6 = 3D Wall Lamp Sconce
            if (tile === 6) {
              return <WallLampMesh key={`${x}-${z}`} position={[x + 0.5, 0, z + 0.5]} />;
            }
            return null;
          })
        )}

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0, 15]}>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#18181b" roughness={1.0} />
        </mesh>

        {/* Low Ceiling */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[15, 1.6, 15]}>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#09090b" roughness={1.0} />
        </mesh>

        <PlayerControls grid={grid} onInteract={onInteract} />
      </Canvas>

      {/* Red Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-red-600 text-3xl font-bold select-none">
        +
      </div>
    </div>
  );
}