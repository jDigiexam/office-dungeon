'use client';

import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useTexture, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

// ----------------------------------------------------
// 1. 3D OBJECTS
// ----------------------------------------------------
function KeycardMesh({ position }) {
  const cardRef = useRef();
  useFrame((_, delta) => { if (cardRef.current) cardRef.current.rotation.y += Math.min(delta, 0.1) * 2.5; });
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.2, 0.25, 0.4, 8]} /><meshStandardMaterial color="#27272a" roughness={0.8} /></mesh>
      <mesh ref={cardRef} position={[0, 0.65, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.35, 0.22, 0.03]} />
        <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function TerminalMesh({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]}><boxGeometry args={[0.6, 0.7, 0.5]} /><meshStandardMaterial color="#18181b" /></mesh>
      <mesh position={[0, 0.85, 0]}><boxGeometry args={[0.45, 0.35, 0.3]} /><meshStandardMaterial color="#09090b" /></mesh>
      <mesh position={[0, 0.85, 0.16]}><planeGeometry args={[0.38, 0.28]} /><meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.9} /></mesh>
    </group>
  );
}

function LitWindowMesh({ position, grid, gx, gz, texture }) {
  let rotY = 0; let offsetX = 0; let offsetZ = 0;
  if (gx > 0 && grid[gz][gx - 1] === 1) { offsetX = -0.49; rotY = Math.PI / 2; }
  else if (gx < grid[0].length - 1 && grid[gz][gx + 1] === 1) { offsetX = 0.49; rotY = -Math.PI / 2; }
  else if (gz > 0 && grid[gz - 1][gx] === 1) { offsetZ = -0.49; rotY = 0; }
  else if (gz < grid.length - 1 && grid[gz + 1][gx] === 1) { offsetZ = 0.49; rotY = Math.PI; }

  return (
    <group position={[position[0] + offsetX, position[1], position[2] + offsetZ]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 2.0, 0]}>
        <planeGeometry args={[0.8, 1.6]} />
        <meshStandardMaterial map={texture} emissive="#f59e0b" emissiveIntensity={0.8} emissiveMap={texture} />
      </mesh>
    </group>
  );
}

function ElevatorMesh({ position, wallTexture }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.8, 0]}><boxGeometry args={[1, 2.4, 1]} /><meshStandardMaterial map={wallTexture} roughness={0.9} /></mesh>
      <mesh position={[0, 0.8, 0]}><boxGeometry args={[0.95, 1.6, 0.1]} /><meshStandardMaterial color="#3f3f46" metalness={0.9} /></mesh>
      <mesh position={[0, 1.5, 0.08]}><boxGeometry args={[0.2, 0.1, 0.02]} /><meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1} /></mesh>
    </group>
  );
}

function DoorMesh({ position, grid, gx, gz, isOpened, wallTexture, doorTexture }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (isOpened && groupRef.current.position.y > -1.6) groupRef.current.position.y -= Math.min(delta, 0.1) * 2;
  });
  let rotY = 0;
  if (gx > 0 && gx < grid[0].length - 1 && grid[gz][gx - 1] === 1 && grid[gz][gx + 1] === 1) rotY = 0;
  else if (gz > 0 && gz < grid.length - 1 && grid[gz - 1][gx] === 1 && grid[gz + 1][gx] === 1) rotY = Math.PI / 2;
  
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 2.8, 0]}><boxGeometry args={[1, 2.4, 1]} /><meshStandardMaterial map={wallTexture} roughness={0.9} /></mesh>
      <group ref={groupRef}>
        <mesh position={[0, 0.8, 0]}><boxGeometry args={[1, 1.6, 0.15]} /><meshStandardMaterial map={doorTexture} color={isOpened ? "#a8a29e" : "#ffffff"} roughness={0.8} /></mesh>
        <mesh position={[0.35, 0.8, 0.08]}><boxGeometry args={[0.1, 0.2, 0.02]} /><meshStandardMaterial color={isOpened ? "#22c55e" : "#ef4444"} emissive={isOpened ? "#16a34a" : "#dc2626"} emissiveIntensity={1} /></mesh>
        <mesh position={[0.35, 0.8, -0.08]}><boxGeometry args={[0.1, 0.2, 0.02]} /><meshStandardMaterial color={isOpened ? "#22c55e" : "#ef4444"} emissive={isOpened ? "#16a34a" : "#dc2626"} emissiveIntensity={1} /></mesh>
      </group>
    </group>
  );
}

function SpiralStaircase({ position, wallTexture, floorTexture }) {
  const steps = 20; 
  const heightPerStep = 4 / steps; 
  const stairRadius = 2.4; 
  const anglePerStep = (Math.PI * 2) / steps;

  return (
    <group position={position}>
      {/* Central Pillar */}
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 4, 16]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>
      
      {/* Outer Enclosure Wall */}
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 4, 16, 1, true]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} side={THREE.BackSide} />
      </mesh>

      {/* Textured Steps */}
      {Array.from({ length: steps }).map((_, i) => (
        <mesh key={i} position={[Math.cos(i * anglePerStep) * (stairRadius / 2), i * heightPerStep + 0.1, Math.sin(i * anglePerStep) * (stairRadius / 2)]} rotation={[0, -i * anglePerStep, 0]}>
          <boxGeometry args={[stairRadius, 0.2, 1.2]} />
          <meshStandardMaterial map={floorTexture} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ----------------------------------------------------
// 2. BULLETPROOF PHYSICS & CONTROLS
// ----------------------------------------------------
function PlayerControls({ grids, stairsRef, textures, onInteract, teleportCoords, clearTeleport, onFloorChange }) {
  const controlsRef = useRef();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const currentFloorRef = useRef(0);
  const bobTime = useRef(0);
  const handRef = useRef();
  const crosshairRef = useRef();
  
  const { camera } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const downVector = useMemo(() => new THREE.Vector3(0, -1, 0), []);

  useEffect(() => {
    if (teleportCoords) {
      camera.position.set(teleportCoords.x, teleportCoords.y, teleportCoords.z);
      clearTeleport();
    }
  }, [teleportCoords, camera, clearTeleport]);

  useEffect(() => {
    const interval = setInterval(() => {
      let fIdx = Math.round(camera.position.y / 4);
      fIdx = Math.max(0, Math.min(2, fIdx));
      if (fIdx !== currentFloorRef.current) {
        currentFloorRef.current = fIdx;
        onFloorChange(fIdx);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [camera, onFloorChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.code === 'KeyW') moveState.current.forward = true;
      if (key === 's' || e.code === 'KeyS') moveState.current.backward = true;
      if (key === 'a' || e.code === 'KeyA') moveState.current.left = true;
      if (key === 'd' || e.code === 'KeyD') moveState.current.right = true;

      if (key === 'e' || e.code === 'KeyE') {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const targetX = Math.floor(camera.position.x + dir.x * 1.3);
        const targetZ = Math.floor(camera.position.z + dir.z * 1.3);
        const fIdx = currentFloorRef.current;
        if (targetZ >= 0 && targetZ < grids[fIdx].length && targetX >= 0 && targetX < grids[fIdx][0].length) {
          onInteract(grids[fIdx][targetZ][targetX], targetX, targetZ, fIdx);
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
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [camera, grids, onInteract]);

  useFrame((state, delta) => {
    if (!controlsRef.current?.isLocked) return;

    const safeDelta = Math.min(delta, 0.1);
    
    const moveSpeed = 3.0 * safeDelta; 
    const isMoving = moveState.current.forward || moveState.current.backward || moveState.current.left || moveState.current.right;

    if (isMoving) bobTime.current += safeDelta * 8; 
    else bobTime.current = THREE.MathUtils.lerp(bobTime.current, 0, safeDelta * 10);
    const bobOffset = Math.sin(bobTime.current) * 0.05; 

    const px = camera.position.x;
    const pz = camera.position.z;
    const inStairwell = px >= 13.0 && px <= 20.0 && pz >= 6.0 && pz <= 13.0;
    
    let targetY = currentFloorRef.current * 4.0; 

    if (inStairwell && stairsRef.current) {
      raycaster.set(new THREE.Vector3(px, camera.position.y + 1, pz), downVector);
      const hits = raycaster.intersectObject(stairsRef.current, true);
      if (hits.length > 0) {
        targetY = hits[0].point.y;
      }
    }

    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + 0.8 + bobOffset, 0.4);

    if (handRef.current) {
      const handOffset = new THREE.Vector3(0.18, -0.15, -0.3);
      handOffset.applyQuaternion(camera.quaternion);
      handRef.current.position.copy(camera.position).add(handOffset);
      handRef.current.quaternion.copy(camera.quaternion);
      handRef.current.position.y += Math.abs(Math.sin(bobTime.current)) * 0.02;
      handRef.current.rotation.z += Math.cos(bobTime.current / 2) * 0.02; 
    }

    if (crosshairRef.current) {
      const crossOffset = new THREE.Vector3(0, 0, -0.5);
      crossOffset.applyQuaternion(camera.quaternion);
      crosshairRef.current.position.copy(camera.position).add(crossOffset);
      crosshairRef.current.quaternion.copy(camera.quaternion);
    }

    const currentFIdx = currentFloorRef.current;
    const oldX = camera.position.x;
    const oldZ = camera.position.z;

    if (moveState.current.forward) controlsRef.current.moveForward(moveSpeed);
    if (moveState.current.backward) controlsRef.current.moveForward(-moveSpeed);
    if (moveState.current.right) controlsRef.current.moveRight(moveSpeed);
    if (moveState.current.left) controlsRef.current.moveRight(-moveSpeed);

    const newX = camera.position.x;
    const newZ = camera.position.z;

    const radius = 0.22;
    const isSolidTile = (x, z) => {
      const gx = Math.floor(x); const gz = Math.floor(z);
      if (gz < 0 || gz >= grids[currentFIdx].length || gx < 0 || gx >= grids[currentFIdx][0].length) return true;
      const tile = grids[currentFIdx][gz][gx];
      return tile === 1 || tile === 2;
    };

    const collidesAt = (x, z) => (
      isSolidTile(x - radius, z - radius) || isSolidTile(x + radius, z - radius) ||
      isSolidTile(x - radius, z + radius) || isSolidTile(x + radius, z + radius)
    );

    camera.position.x = newX;
    camera.position.z = oldZ;
    if (collidesAt(camera.position.x, camera.position.z)) camera.position.x = oldX;

    camera.position.z = newZ;
    if (collidesAt(camera.position.x, camera.position.z)) camera.position.z = oldZ;
  });

  return (
    <>
      <PointerLockControls makeDefault ref={controlsRef} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI * 3 / 4} />
      <mesh ref={handRef} renderOrder={999}>
        <planeGeometry args={[0.23, 0.23]} />
        <meshBasicMaterial map={textures.hand} transparent={true} depthTest={false} />
      </mesh>
      <mesh ref={crosshairRef} renderOrder={1000}>
        <ringGeometry args={[0.005, 0.008, 16]} />
        <meshBasicMaterial color="#dc2626" depthTest={false} transparent={true} opacity={0.8} />
      </mesh>
    </>
  );
}

// ----------------------------------------------------
// 3. MAIN SCENE RENDERING
// ----------------------------------------------------
function DungeonScene({ grids, onInteract, teleportCoords, clearTeleport, onFloorChange }) {
  const stairsRef = useRef();

  const [tWallStone, tFloorStone, tWindow, tHand, tWallWood, tFloorWood] = useTexture([
    '/wall_stone.png',
    '/floor_stone_pattern.png',
    '/window_tall_rounded_lit.png',
    '/hand.png',
    '/wall_timber.png',
    '/floor_tiles_tan_large.png'
  ]);

  useEffect(() => {
    [tWallStone, tFloorStone, tWindow, tHand, tWallWood, tFloorWood].forEach(t => {
      if(t) {
        t.magFilter = t.minFilter = THREE.NearestFilter;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.needsUpdate = true;
      }
    });
    if(tWallStone) tWallStone.repeat.set(1, 4);
    if(tWallWood) tWallWood.repeat.set(1, 4);
  }, [tWallStone, tFloorStone, tWindow, tHand, tWallWood, tFloorWood]);

  return (
    <>
      {/* WOOD WALLS (Floors 0 & 1) */}
      <Instances limit={1500}>
        <boxGeometry args={[1, 4, 1]} />
        <meshStandardMaterial map={tWallWood} color="#ffffff" roughness={0.9} />
        {grids.map((grid, fIdx) => fIdx < 2 && grid.map((row, z) => row.map((tile, x) => {
          if (tile === 1 || tile === 6) return <Instance key={`wwall-${fIdx}-${x}-${z}`} position={[x + 0.5, fIdx * 4 + 2.0, z + 0.5]} />;
          if (tile === 2 || tile === 8 || tile === 3) return <Instance key={`wlintel-${fIdx}-${x}-${z}`} position={[x + 0.5, fIdx * 4 + 2.8, z + 0.5]} scale={[1, 0.6, 1]} />;
          return null;
        })))}
      </Instances>

      {/* STONE WALLS (Floor 2) */}
      <Instances limit={1500}>
        <boxGeometry args={[1, 4, 1]} />
        <meshStandardMaterial map={tWallStone} color="#ffffff" roughness={0.9} />
        {grids.map((grid, fIdx) => fIdx >= 2 && grid.map((row, z) => row.map((tile, x) => {
          if (tile === 1 || tile === 6) return <Instance key={`swall-${fIdx}-${x}-${z}`} position={[x + 0.5, fIdx * 4 + 2.0, z + 0.5]} />;
          if (tile === 2 || tile === 8 || tile === 3) return <Instance key={`slintel-${fIdx}-${x}-${z}`} position={[x + 0.5, fIdx * 4 + 2.8, z + 0.5]} scale={[1, 0.6, 1]} />;
          return null;
        })))}
      </Instances>

      {/* WOOD FLOORS (Floors 0 & 1) */}
      <Instances limit={1500}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial map={tFloorWood} color="#ffffff" roughness={1.0} />
        {grids.map((grid, fIdx) => fIdx < 2 && grid.map((row, z) => row.map((tile, x) => {
          if (tile !== 7 && tile !== 1 && tile !== 6) return <Instance key={`wfloor-${fIdx}-${x}-${z}`} position={[x + 0.5, fIdx * 4, z + 0.5]} rotation={[-Math.PI / 2, 0, 0]} />;
          return null;
        })))}
      </Instances>

      {/* STONE FLOORS (Floor 2) */}
      <Instances limit={1500}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial map={tFloorStone} color="#ffffff" roughness={1.0} />
        {grids.map((grid, fIdx) => fIdx >= 2 && grid.map((row, z) => row.map((tile, x) => {
          if (tile !== 7 && tile !== 1 && tile !== 6) return <Instance key={`sfloor-${fIdx}-${x}-${z}`} position={[x + 0.5, fIdx * 4, z + 0.5]} rotation={[-Math.PI / 2, 0, 0]} />;
          return null;
        })))}
      </Instances>

      {/* CEILINGS (All Floors) */}
      <Instances limit={1500}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#18181b" roughness={1.0} />
        {grids.map((grid, fIdx) => grid.map((row, z) => row.map((tile, x) => {
          if (tile !== 7 && tile !== 1 && tile !== 6) return <Instance key={`ceil-${fIdx}-${x}-${z}`} position={[x + 0.5, fIdx * 4 + 4.0, z + 0.5]} rotation={[Math.PI / 2, 0, 0]} />;
          return null;
        })))}
      </Instances>

      {grids.map((grid, fIdx) => (
        <group key={`interactive-${fIdx}`} position={[0, fIdx * 4, 0]}>
          {grid.map((row, z) =>
            row.map((tile, x) => {
              const elements = [];
              const wTex = fIdx < 2 ? tWallWood : tWallStone;
              
              // We'll use the wood wall texture for the doors themselves to match the aesthetic
              if (tile === 2 || tile === 8) elements.push(<DoorMesh key="door" position={[x + 0.5, 0, z + 0.5]} grid={grid} gx={x} gz={z} isOpened={tile === 8} wallTexture={wTex} doorTexture={tWallWood} />);
              if (tile === 3) elements.push(<ElevatorMesh key="elev" position={[x + 0.5, 0, z + 0.5]} wallTexture={wTex} />);
              if (tile === 4) elements.push(<TerminalMesh key="term" position={[x + 0.5, 0, z + 0.5]} />);
              if (tile === 5) elements.push(<KeycardMesh key="key" position={[x + 0.5, 0, z + 0.5]} />);
              if (tile === 6) elements.push(<LitWindowMesh key="window" position={[x + 0.5, 0, z + 0.5]} grid={grid} gx={x} gz={z} texture={tWindow} />);
              return <group key={`int-${x}-${z}`}>{elements}</group>;
            })
          )}
        </group>
      ))}

      <group ref={stairsRef}>
        <SpiralStaircase position={[16.5, 0, 9.5]} wallTexture={tWallWood} floorTexture={tFloorWood} />
        <SpiralStaircase position={[16.5, 4.0, 9.5]} wallTexture={tWallStone} floorTexture={tFloorStone} />
      </group>

      <PlayerControls grids={grids} stairsRef={stairsRef} textures={{hand: tHand}} onInteract={onInteract} teleportCoords={teleportCoords} clearTeleport={clearTeleport} onFloorChange={onFloorChange} />
    </>
  );
}

export default function DungeonEngine({ grids, onInteract, teleportCoords, clearTeleport, onFloorChange }) {
  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas camera={{ position: [2.5, 0.8, 2.5], fov: 80, near: 0.01, far: 50 }} gl={{ antialias: false }}>
        <fog attach="fog" args={['#000000', 3, 16]} />
        <ambientLight intensity={0.6} color="#ffffff" />
        <Suspense fallback={null}>
          <DungeonScene grids={grids} onInteract={onInteract} teleportCoords={teleportCoords} clearTeleport={clearTeleport} onFloorChange={onFloorChange} />
        </Suspense>
      </Canvas>
    </div>
  );
}