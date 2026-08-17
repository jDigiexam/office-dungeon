'use client';

import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ----------------------------------------------------
// 1. FAST RAW INSTANCED MESH BUFFER
// ----------------------------------------------------
function FastInstancedMesh({ geometryArgs, materialProps, coords }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useEffect(() => {
    if (!meshRef.current || coords.length === 0) return;
    coords.forEach((pos, i) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      if (pos.length > 3) dummy.rotation.set(pos[3], pos[4], pos[5]);
      else dummy.rotation.set(0, 0, 0);
      if (pos.length > 6) dummy.scale.set(pos[6], pos[7], pos[8]);
      else dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [coords, dummy]);

  if (coords.length === 0) return null;

  return (
    <instancedMesh key={coords.length} ref={meshRef} args={[null, null, coords.length]}>
      {geometryArgs.type === 'box' ? <boxGeometry args={geometryArgs.args} /> : <planeGeometry args={geometryArgs.args} />}
      <meshStandardMaterial {...materialProps} />
    </instancedMesh>
  );
}

// ----------------------------------------------------
// 2. 3D INTERACTIVE OBJECTS
// ----------------------------------------------------
function KeycardMesh({ position, texture, color }) {
  const cardRef = useRef();
  useFrame((_, delta) => { if (cardRef.current) cardRef.current.rotation.y += Math.min(delta, 0.1) * 2.0; });
  return (
    <group position={position}>
      <mesh ref={cardRef} position={[0, 0.4, 0]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial map={texture} emissive={color} emissiveIntensity={0.2} transparent={true} side={THREE.DoubleSide} alphaTest={0.5} />
      </mesh>
      <pointLight position={[0, 0.4, 0]} intensity={1.5} distance={3} color={color} />
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

function CeilingLightMesh({ position, texture }) {
  return (
    <group position={[position[0], 3.98, position[2]]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh><planeGeometry args={[1, 1]} /><meshStandardMaterial color="#18181b" roughness={1.0} /></mesh>
      <mesh position={[0, 0, 0.01]}><planeGeometry args={[0.6, 0.6]} /><meshStandardMaterial map={texture} emissive="#f59e0b" emissiveIntensity={1} emissiveMap={texture} transparent={true} /></mesh>
      <pointLight position={[0, 0, 0.3]} intensity={3.5} distance={12} color="#fbbf24" />
    </group>
  );
}

function ElevatorMesh({ position, grid, gx, gz, isOpened, wallTexture, doorTexture, litTexture }) {
  const leftDoor = useRef();
  const rightDoor = useRef();
  
  useFrame((_, delta) => {
    const speed = Math.min(delta, 0.1) * 2;
    if (isOpened) {
      if (leftDoor.current.position.x > -0.7) leftDoor.current.position.x -= speed;
      if (rightDoor.current.position.x < 0.7) rightDoor.current.position.x += speed;
    } else {
      if (leftDoor.current.position.x < -0.25) leftDoor.current.position.x += speed;
      if (rightDoor.current.position.x > 0.25) rightDoor.current.position.x -= speed;
    }
  });

  let rotY = 0;
  if (grid[gz + 1]?.[gx] === 0 || grid[gz + 1]?.[gx] === 6) rotY = 0;
  else if (grid[gz - 1]?.[gx] === 0 || grid[gz - 1]?.[gx] === 6) rotY = Math.PI;
  else if (grid[gz]?.[gx + 1] === 0 || grid[gz]?.[gx + 1] === 6) rotY = Math.PI / 2;
  else if (grid[gz]?.[gx - 1] === 0 || grid[gz]?.[gx - 1] === 6) rotY = -Math.PI / 2;

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 3.0, 0.4]}><boxGeometry args={[1, 2.0, 0.2]} /><meshStandardMaterial map={wallTexture} roughness={0.9} /></mesh>
      <mesh position={[0, 2.0, -0.45]}><boxGeometry args={[1, 4.0, 0.1]} /><meshStandardMaterial color="#27272a" /></mesh>
      <mesh position={[-0.45, 2.0, 0]}><boxGeometry args={[0.1, 4.0, 0.8]} /><meshStandardMaterial color="#27272a" /></mesh>
      <mesh position={[0.45, 2.0, 0]}><boxGeometry args={[0.1, 4.0, 0.8]} /><meshStandardMaterial color="#27272a" /></mesh>
      <mesh position={[0, 3.99, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[1, 1]} /><meshStandardMaterial color="#18181b" /></mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1, 1]} /><meshStandardMaterial color="#3f3f46" /></mesh>
      <group position={[0, 0, 0.4]}>
        <mesh ref={leftDoor} position={[-0.25, 1.0, 0]}><boxGeometry args={[0.5, 2.0, 0.05]} /><meshStandardMaterial map={doorTexture} roughness={0.5} emissive="#ffffff" emissiveMap={doorTexture} emissiveIntensity={0.25} /></mesh>
        <mesh ref={rightDoor} position={[0.25, 1.0, 0]}><boxGeometry args={[0.5, 2.0, 0.05]} /><meshStandardMaterial map={doorTexture} roughness={0.5} emissive="#ffffff" emissiveMap={doorTexture} emissiveIntensity={0.25} /></mesh>
      </group>
      <mesh position={[0.4, 1.2, 0.51]}><planeGeometry args={[0.15, 0.15]} /><meshStandardMaterial map={litTexture} emissive="#f59e0b" emissiveIntensity={0.8} /></mesh>
    </group>
  );
}

function DoorMesh({ position, grid, gx, gz, isOpened, wallTexture, doorTexture, trimColor }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (isOpened && groupRef.current.position.y > -2.0) groupRef.current.position.y -= Math.min(delta, 0.1) * 2;
  });
  let rotY = 0;
  if (gx > 0 && gx < grid[0].length - 1 && grid[gz][gx - 1] === 1 && grid[gz][gx + 1] === 1) rotY = 0;
  else if (gz > 0 && gz < grid.length - 1 && grid[gz - 1][gx] === 1 && grid[gz + 1][gx] === 1) rotY = Math.PI / 2;
  
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 3.0, 0]}><boxGeometry args={[1, 2.0, 1]} /><meshStandardMaterial map={wallTexture} roughness={0.9} /></mesh>
      <group ref={groupRef}>
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[1, 2.0, 0.15]} />
          <meshStandardMaterial 
            map={doorTexture} 
            color={isOpened ? "#a8a29e" : "#ffffff"} 
            roughness={0.8} 
            emissive="#ffffff" 
            emissiveMap={doorTexture} 
            emissiveIntensity={0.25} 
          />
        </mesh>
        <mesh position={[0.35, 1.0, 0.08]}><boxGeometry args={[0.1, 0.2, 0.02]} /><meshStandardMaterial color={isOpened ? "#22c55e" : trimColor} emissive={isOpened ? "#16a34a" : trimColor} emissiveIntensity={1} /></mesh>
        <mesh position={[0.35, 1.0, -0.08]}><boxGeometry args={[0.1, 0.2, 0.02]} /><meshStandardMaterial color={isOpened ? "#22c55e" : trimColor} emissive={isOpened ? "#16a34a" : trimColor} emissiveIntensity={1} /></mesh>
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
      <mesh position={[0, 2.0, 0]}><cylinderGeometry args={[0.4, 0.4, 4, 16]} /><meshStandardMaterial map={wallTexture} roughness={0.9} /></mesh>
      <mesh position={[0, 2.0, 0]} rotation={[0, Math.PI * 1.25, 0]}><cylinderGeometry args={[2.5, 2.5, 4, 16, 1, true, 0, Math.PI * 1.5]} /><meshStandardMaterial map={wallTexture} roughness={0.9} side={THREE.DoubleSide} /></mesh>
      {Array.from({ length: steps }).map((_, i) => (
        <mesh key={i} position={[Math.cos(i * anglePerStep) * (stairRadius / 2), i * heightPerStep + 0.1, Math.sin(i * anglePerStep) * (stairRadius / 2)]} rotation={[0, -i * anglePerStep, 0]}>
          <boxGeometry args={[stairRadius, 0.2, 1.2]} /><meshStandardMaterial map={floorTexture} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ----------------------------------------------------
// 3. BULLETPROOF PHYSICS & CONTROLS
// ----------------------------------------------------
function PlayerControls({ grids, handTexture, onInteract, teleportCoords, clearTeleport, onFloorChange }) {
  const controlsRef = useRef();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const currentFloorRef = useRef(0);
  const bobTime = useRef(0);
  const handRef = useRef();
  
  const { camera } = useThree();

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
      if (key === 'w') moveState.current.forward = true;
      if (key === 's') moveState.current.backward = true;
      if (key === 'a') moveState.current.left = true;
      if (key === 'd') moveState.current.right = true;

      if (key === 'e') {
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
      if (key === 'w') moveState.current.forward = false;
      if (key === 's') moveState.current.backward = false;
      if (key === 'a') moveState.current.left = false;
      if (key === 'd') moveState.current.right = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [camera, grids, onInteract]);

  useFrame((state, delta) => {
    if (!controlsRef.current?.isLocked) return;

    const safeDelta = Math.min(delta, 0.1);
    const moveSpeed = 4.0 * safeDelta; 
    const isMoving = moveState.current.forward || moveState.current.backward || moveState.current.left || moveState.current.right;

    if (isMoving) bobTime.current += safeDelta * 8; 
    else bobTime.current = THREE.MathUtils.lerp(bobTime.current, 0, safeDelta * 10);
    const bobOffset = Math.sin(bobTime.current) * 0.05; 

    camera.position.y = THREE.MathUtils.lerp(camera.position.y, currentFloorRef.current * 4.0 + 0.8 + bobOffset, 0.4);

    if (handRef.current) {
      const handOffset = new THREE.Vector3(0.18, -0.15, -0.3);
      handOffset.applyQuaternion(camera.quaternion);
      handRef.current.position.copy(camera.position).add(handOffset);
      handRef.current.quaternion.copy(camera.quaternion);
      handRef.current.position.y += Math.abs(Math.sin(bobTime.current)) * 0.02;
      handRef.current.rotation.z += Math.cos(bobTime.current / 2) * 0.02; 
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
      return [1, 2, 12, 22, 3, 4].includes(tile);
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
      <mesh ref={handRef} renderOrder={999}><planeGeometry args={[0.23, 0.23]} /><meshBasicMaterial map={handTexture} transparent={true} depthTest={false} /></mesh>
    </>
  );
}

// ----------------------------------------------------
// 4. MAIN SCENE RENDERING
// ----------------------------------------------------
function DungeonScene({ grids, onInteract, teleportCoords, clearTeleport, onFloorChange }) {
  const woodTexList = useTexture([
    '/wall_timber_structure_cross.png', '/wall_timber_structure_diagonal.png',
    '/wall_timber_structure_vertical.png', '/wall_timber_structure.png'
  ]);
  const stoneTexList = useTexture([
    '/wall_brick_stone_both.png', '/wall_brick_stone_center_banner.png',
    '/wall_brick_stone_center_depth.png', '/wall_brick_stone_center.png',
    '/wall_brick_stone_left.png', '/wall_brick_stone_right.png',
    '/wall_stone_depth.png', '/wall_stone.png'
  ]);

  const [tFloorStone, tFloorWood, tDoorWood, tDoorMetal, tDoorMetalFrame, tWindow, tHand, tKeyRed, tKeyBlue, tKeyYellow] = useTexture([
    '/floor_stone_pattern.png', '/floor_tiles_tan_large.png', '/door_wood.png', '/door_metal_gate.png',
    '/door_metal_frame.png', '/window_round_pane_lit.png', '/hand.png',
    '/red_keycard.png', '/blue_keycard.png', '/yellow_keycard.png'
  ]);

  useEffect(() => {
    [...woodTexList, ...stoneTexList, tFloorStone, tFloorWood, tDoorWood, tDoorMetal, tDoorMetalFrame, tWindow, tHand, tKeyRed, tKeyBlue, tKeyYellow].forEach(t => {
      if(t) { t.magFilter = t.minFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; }
    });
    woodTexList.forEach(t => t.repeat.set(1, 4));
    stoneTexList.forEach(t => t.repeat.set(1, 4));
  }, [woodTexList, stoneTexList, tFloorStone, tFloorWood, tDoorWood, tDoorMetal, tDoorMetalFrame, tWindow, tHand, tKeyRed, tKeyBlue, tKeyYellow]);

  // Pre-calculate ALL coordinates and aggressively cull hidden surfaces AND VOID FLOORS!
  const { woodWallCoords, stoneWallCoords, woodFloorCoords, stoneFloorCoords, ceilingCoords, interactiveElements } = useMemo(() => {
    const wWalls = woodTexList.map(() => []);
    const sWalls = stoneTexList.map(() => []);
    const wFloors = [];
    const sFloors = [];
    const ceils = [];
    const interactives = [];

    grids.forEach((grid, fIdx) => {
      if (!grid) return;
      const isWoodFloor = fIdx < 2;
      const wLen = woodTexList.length;
      const sLen = stoneTexList.length;
      const rows = grid.length;
      const cols = grid[0].length;

      for (let z = 0; z < rows; z++) {
        for (let x = 0; x < cols; x++) {
          const tile = grid[z][x];
          
          // 🚨 HIDDEN SURFACE REMOVAL: Only render walls that touch a playable space
          if (tile === 1) {
            let isVisible = false;
            if (z > 0 && grid[z-1][x] !== 1) isVisible = true;
            else if (z < rows - 1 && grid[z+1][x] !== 1) isVisible = true;
            else if (x > 0 && grid[z][x-1] !== 1) isVisible = true;
            else if (x < cols - 1 && grid[z][x+1] !== 1) isVisible = true;

            if (isVisible) {
              const tIdx = (x * 7 + z * 13 + fIdx * 3) % (isWoodFloor ? wLen : sLen);
              const wPos = [x + 0.5, fIdx * 4 + 2.0, z + 0.5];
              if (isWoodFloor) wWalls[tIdx].push(wPos); else sWalls[tIdx].push(wPos);
            }
            continue; // Move on to the next tile! No floor/ceiling for void!
          }

          // 🚨 FIX: tile === 1 (The vast Void) is fully skipped before reaching here!
          
          // Fast Ceilings
          if (![7,3,10].includes(tile) && tile !== 6) {
            ceils.push([x + 0.5, fIdx * 4 + 3.98, z + 0.5, Math.PI / 2, 0, 0]);
          }

          // Fast Floors
          if (![7,3,10].includes(tile)) {
            const fPos = [x + 0.5, fIdx * 4, z + 0.5, -Math.PI / 2, 0, 0];
            if (isWoodFloor) wFloors.push(fPos); else sFloors.push(fPos);
          }

          // Fast Lintels (Above doors)
          if ([2,8,12,18,22,28].includes(tile)) {
            const tIdx = (x * 7 + z * 13 + fIdx * 3) % (isWoodFloor ? wLen : sLen);
            const lPos = [x + 0.5, fIdx * 4 + 3.0, z + 0.5, 0, 0, 0, 1, 0.5, 1];
            if (isWoodFloor) wWalls[tIdx].push(lPos); else sWalls[tIdx].push(lPos);
          }

          // Interactive Items
          if ([2,8,12,18,22,28, 3,10, 4, 5,15,25, 6].includes(tile)) {
            interactives.push({ tile, x, z, fIdx });
          }
        }
      }
    });

    return { woodWallCoords: wWalls, stoneWallCoords: sWalls, woodFloorCoords: wFloors, stoneFloorCoords: sFloors, ceilingCoords: ceils, interactiveElements: interactives };
  }, [grids, woodTexList.length, stoneTexList.length]);

  return (
    <>
      {/* 🚨 BUFFERED CULLED WALLS */}
      {woodTexList.map((tex, i) => <FastInstancedMesh key={`wwall-${i}`} geometryArgs={{type: 'box', args: [1, 4, 1]}} materialProps={{map: tex, color: "#ffffff", roughness: 0.9}} coords={woodWallCoords[i]} />)}
      {stoneTexList.map((tex, i) => <FastInstancedMesh key={`swall-${i}`} geometryArgs={{type: 'box', args: [1, 4, 1]}} materialProps={{map: tex, color: "#ffffff", roughness: 0.9}} coords={stoneWallCoords[i]} />)}

      {/* 🚨 BUFFERED CULLED FLOORS & CEILINGS */}
      <FastInstancedMesh geometryArgs={{type: 'plane', args: [1, 1]}} materialProps={{map: tFloorWood, color: "#ffffff", roughness: 1.0}} coords={woodFloorCoords} />
      <FastInstancedMesh geometryArgs={{type: 'plane', args: [1, 1]}} materialProps={{map: tFloorStone, color: "#ffffff", roughness: 1.0}} coords={stoneFloorCoords} />
      <FastInstancedMesh geometryArgs={{type: 'plane', args: [1, 1]}} materialProps={{color: "#18181b", roughness: 1.0}} coords={ceilingCoords} />

      {/* 🚨 DYNAMIC INTERACTIVES */}
      {interactiveElements.map((el, idx) => {
        const { tile, x, z, fIdx } = el;
        const wTexList = fIdx < 2 ? woodTexList : stoneTexList;
        const wTex = wTexList[(x * 7 + z * 13 + fIdx * 3) % wTexList.length];
        const dTex = fIdx < 2 ? tDoorWood : tDoorMetal;
        
        if ([2,8,12,18,22,28].includes(tile)) {
          let trimColor = "#dc2626";
          if (tile === 12 || tile === 18) trimColor = "#2563eb";
          if (tile === 22 || tile === 28) trimColor = "#eab308";
          return <DoorMesh key={`int-${idx}`} position={[x + 0.5, 0, z + 0.5]} grid={grids[fIdx]} gx={x} gz={z} isOpened={[8,18,28].includes(tile)} wallTexture={wTex} doorTexture={dTex} trimColor={trimColor} />;
        }
        if (tile === 3 || tile === 10) return <ElevatorMesh key={`int-${idx}`} position={[x + 0.5, 0, z + 0.5]} grid={grids[fIdx]} gx={x} gz={z} isOpened={tile === 10} wallTexture={wTex} doorTexture={tDoorMetalFrame} litTexture={tWindow} />;
        if (tile === 4) return <TerminalMesh key={`int-${idx}`} position={[x + 0.5, 0, z + 0.5]} />;
        
        if (tile === 5) return <KeycardMesh key={`int-${idx}`} position={[x + 0.5, 0, z + 0.5]} texture={tKeyRed} color="#dc2626" />;
        if (tile === 15) return <KeycardMesh key={`int-${idx}`} position={[x + 0.5, 0, z + 0.5]} texture={tKeyBlue} color="#2563eb" />;
        if (tile === 25) return <KeycardMesh key={`int-${idx}`} position={[x + 0.5, 0, z + 0.5]} texture={tKeyYellow} color="#eab308" />;
        
        if (tile === 6) return <CeilingLightMesh key={`int-${idx}`} position={[x + 0.5, 0, z + 0.5]} texture={tWindow} />;
        return null;
      })}

      <SpiralStaircase position={[16.5, 0, 9.5]} wallTexture={woodTexList[0]} floorTexture={tFloorWood} />
      <SpiralStaircase position={[16.5, 4.0, 9.5]} wallTexture={stoneTexList[0]} floorTexture={tFloorStone} />
      
      <PlayerControls grids={grids} handTexture={tHand} onInteract={onInteract} teleportCoords={teleportCoords} clearTeleport={clearTeleport} onFloorChange={onFloorChange} />
    </>
  );
}

export default function DungeonEngine({ grids, initialSpawn, onInteract, teleportCoords, clearTeleport, onFloorChange }) {
  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas camera={{ position: initialSpawn || [5.5, 0.8, 5.5], fov: 80, near: 0.01, far: 50 }} gl={{ antialias: false }}>
        <fog attach="fog" args={['#000000', 4, 18]} />
        <ambientLight intensity={0.4} color="#ffffff" />
        <Suspense fallback={null}>
          <DungeonScene grids={grids} onInteract={onInteract} teleportCoords={teleportCoords} clearTeleport={clearTeleport} onFloorChange={onFloorChange} />
        </Suspense>
      </Canvas>
    </div>
  );
}