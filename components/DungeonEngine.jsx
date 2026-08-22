'use client';

import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

// ----------------------------------------------------
// 1. CONSTANTS
// ----------------------------------------------------
const FLOOR_HT = 3.2; 

// ----------------------------------------------------
// 2. RAW C-LEVEL MEMORY BUFFER
// ----------------------------------------------------
function FastInstancedMesh({ geometryArgs, materialProps, bufferData }) {
  const meshRef = useRef();
  
  useEffect(() => {
    if (meshRef.current && bufferData.count > 0) {
      meshRef.current.instanceMatrix = new THREE.InstancedBufferAttribute(bufferData.array, 16);
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [bufferData]);

  if (bufferData.count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[null, null, bufferData.count]} frustumCulled={false}>
      {geometryArgs.type === 'box' ? <boxGeometry args={geometryArgs.args} /> : <planeGeometry args={geometryArgs.args} />}
      <meshStandardMaterial {...materialProps} />
    </instancedMesh>
  );
}

function createBuffer() {
  let data = new Float32Array(1000 * 16); 
  let count = 0;
  return {
    add: (dummy) => {
      if (count * 16 >= data.length) {
        const newData = new Float32Array(data.length * 2);
        newData.set(data);
        data = newData;
      }
      dummy.updateMatrix();
      data.set(dummy.matrix.elements, count * 16);
      count++;
    },
    finalize: () => ({ array: data.slice(0, count * 16), count })
  };
}

// ----------------------------------------------------
// 3. 3D INTERACTIVE OBJECTS
// ----------------------------------------------------
function KeycardMesh({ position, texture, color }) {
    const cardRef = useRef();
    
    useFrame((_, delta) => { 
      if (cardRef.current) {
        const safeDelta = Math.min(delta, 0.1);
        
        // 1. Keep the classic rotation
        cardRef.current.rotation.y += safeDelta * 2.0; 
        
        // 2. 🚨 NEW: Animate rising out of the ground
        if (cardRef.current.position.y < 0.4) {
          // Smoothly lerp the card upwards
          cardRef.current.position.y = THREE.MathUtils.lerp(cardRef.current.position.y, 0.45, safeDelta * 4.0);
          
          // Snap it to exactly 0.4 once it gets close enough to stop the math calculations
          if (cardRef.current.position.y >= 0.4) {
            cardRef.current.position.y = 0.4;
          }
        }
      } 
    });
    
    return (
      <group position={position}>
        {/* 🚨 NEW: We start the Y position at -1.0 (completely under the floor) */}
        <mesh ref={cardRef} position={[0, -1.0, 0]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshStandardMaterial 
            map={texture} 
            emissive={color} 
            emissiveIntensity={0.8} 
            transparent={true} 
            side={THREE.DoubleSide} 
            alphaTest={0.5} 
          />
        </mesh>
      </group>
    );
  }

function TerminalMesh({ position, texture }) {
    const crtRef = useRef();
    
    // 🚨 FIX: "Billboarding" - The CRT monitor always rotates to face the player's camera
    useFrame(({ camera }) => { 
      if (crtRef.current) {
        crtRef.current.lookAt(camera.position); 
      }
    });
    
    return (
      <group position={position}>
        {/* The Solid Gray Pedestal (Does not rotate) */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.5, 0.8, 0.5]} />
          <meshStandardMaterial color="#808080" roughness={0.9} />
        </mesh>
        
        {/* The CRT Monitor Sprite (Rotates to face the player) */}
        <mesh ref={crtRef} position={[0, 1.1, 0]}>
          <planeGeometry args={[0.7, 0.7]} />
          <meshStandardMaterial 
            map={texture} 
            emissive="#ffffff" 
            emissiveMap={texture} 
            emissiveIntensity={0.6} 
            transparent={true} 
            side={THREE.DoubleSide} 
            alphaTest={0.5} 
          />
        </mesh>
      </group>
    );
  }

function CeilingLightMesh({ position, texture }) {
  return (
    <group position={[position[0], position[1] + FLOOR_HT - 0.02, position[2]]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh><planeGeometry args={[1, 1]} /><meshStandardMaterial color="#18181b" roughness={1.0} /></mesh>
      <mesh position={[0, 0, 0.01]}><planeGeometry args={[0.6, 0.6]} /><meshStandardMaterial map={texture} emissive="#f59e0b" emissiveIntensity={2.5} emissiveMap={texture} transparent={true} /></mesh>
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

  const lintelHt = FLOOR_HT - 2.0;

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 2.0 + (lintelHt/2), 0.4]}><boxGeometry args={[1, lintelHt, 0.2]} /><meshStandardMaterial map={wallTexture} roughness={0.9} /></mesh>
      <mesh position={[0, 1.0, -0.45]}><boxGeometry args={[1, 2.0, 0.1]} /><meshStandardMaterial color="#27272a" /></mesh>
      <mesh position={[-0.45, 1.0, 0]}><boxGeometry args={[0.1, 2.0, 0.8]} /><meshStandardMaterial color="#27272a" /></mesh>
      <mesh position={[0.45, 1.0, 0]}><boxGeometry args={[0.1, 2.0, 0.8]} /><meshStandardMaterial color="#27272a" /></mesh>
      <mesh position={[0, FLOOR_HT - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[1, 1]} /><meshStandardMaterial color="#18181b" /></mesh>
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
  
  const lintelHt = FLOOR_HT - 2.0;

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 2.0 + (lintelHt/2), 0]}><boxGeometry args={[1, lintelHt, 1]} /><meshStandardMaterial map={wallTexture} roughness={0.9} /></mesh>
      <group ref={groupRef}>
        <mesh position={[0, 1.0, 0]}><boxGeometry args={[1, 2.0, 0.15]} /><meshStandardMaterial map={doorTexture} color={isOpened ? "#a8a29e" : "#ffffff"} roughness={0.8} emissive="#ffffff" emissiveMap={doorTexture} emissiveIntensity={0.25} /></mesh>
        <mesh position={[0.35, 1.0, 0.08]}><boxGeometry args={[0.1, 0.2, 0.02]} /><meshStandardMaterial color={isOpened ? "#22c55e" : trimColor} emissive={isOpened ? "#16a34a" : trimColor} emissiveIntensity={1} /></mesh>
        <mesh position={[0.35, 1.0, -0.08]}><boxGeometry args={[0.1, 0.2, 0.02]} /><meshStandardMaterial color={isOpened ? "#22c55e" : trimColor} emissive={isOpened ? "#16a34a" : trimColor} emissiveIntensity={1} /></mesh>
      </group>
    </group>
  );
}

// ----------------------------------------------------
// 4. BULLETPROOF PHYSICS & CONTROLS
// ----------------------------------------------------
function PlayerControls({ grids, handTexture, onInteract, teleportCoords, clearTeleport, onFloorChange, onEnterElevator }) {
  const controlsRef = useRef();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const currentFloorRef = useRef(0);
  const elevatorDebounce = useRef(false);
  
  const bobTime = useRef(0);
  const bobAmp = useRef(0); 
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
      let fIdx = Math.round(camera.position.y / FLOOR_HT);
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
      if (e.repeat) return; 
      
      // 🚨 FIX 1: If the mouse is not locked (e.g., a puzzle is open), completely ignore game inputs!
      if (!document.pointerLockElement) return;

      const key = e.key.toLowerCase();
      if (key === 'w') moveState.current.forward = true;
      if (key === 's') moveState.current.backward = true;
      if (key === 'a') moveState.current.left = true;
      if (key === 'd') moveState.current.right = true;

      if (key === 'e') {
        // 🚨 FIX 2: Prevent the browser from passing this "e" into the auto-focused text box
        e.preventDefault(); 
        
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
      // Also ignore key releases if the menu is open
      if (!document.pointerLockElement) return;

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

    if (isMoving) {
      bobTime.current += safeDelta * 8; 
      bobAmp.current = THREE.MathUtils.lerp(bobAmp.current, 1, safeDelta * 10);
    } else {
      bobAmp.current = THREE.MathUtils.lerp(bobAmp.current, 0, safeDelta * 10);
    }
    
    const bobOffset = Math.sin(bobTime.current) * 0.05 * bobAmp.current; 
    const currentFIdx = currentFloorRef.current;
    
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, currentFIdx * FLOOR_HT + 1.2 + bobOffset, 0.4);

    if (handRef.current) {
      const handOffset = new THREE.Vector3(0.18, -0.15, -0.3);
      handOffset.applyQuaternion(camera.quaternion);
      handRef.current.position.copy(camera.position).add(handOffset);
      handRef.current.quaternion.copy(camera.quaternion);
      
      handRef.current.position.y += Math.abs(Math.sin(bobTime.current)) * 0.02 * bobAmp.current;
      handRef.current.rotation.z += Math.cos(bobTime.current / 2) * 0.02 * bobAmp.current; 
    }

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
      // added 32 to the array to handle light gray manually opened door
      return [1, 2, 12, 22, 7, 3, 4, 32].includes(tile);
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

    // 🚨 NEW: Elevator Proximity Trigger (If you walk into an open elevator tile (10), you teleport)
    const currentMapTile = grids[currentFIdx]?.[Math.floor(camera.position.z)]?.[Math.floor(camera.position.x)];
    if (currentMapTile === 10 && !elevatorDebounce.current) {
      elevatorDebounce.current = true;
      onEnterElevator(currentFIdx);
      setTimeout(() => { elevatorDebounce.current = false; }, 2000);
    }
  });

  return (
    <>
      <PointerLockControls makeDefault ref={controlsRef} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI * 3 / 4} />
      <mesh ref={handRef} renderOrder={999}>
        <planeGeometry args={[0.23, 0.23]} />
        <meshBasicMaterial map={handTexture} transparent={true} depthTest={false} />
        <pointLight intensity={2.0} distance={20} color="#fffbeb" decay={2} />
      </mesh>
    </>
  );
}

// ----------------------------------------------------
// 5. MAIN SCENE RENDERING
// ----------------------------------------------------
function DungeonScene({ grids, initialSpawn, onInteract, teleportCoords, clearTeleport, onFloorChange, onEnterElevator }) {
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

  const [tFloorStone, tFloorWood, tDoorWood, tDoorMetal, tDoorMetalFrame, tWindow, tHand, tKeyRed, tKeyBlue, tKeyYellow, tCrt] = useTexture([
    '/floor_stone_pattern.png', '/floor_tiles_tan_large.png', '/door_wood.png', '/door_metal_gate.png',
    '/door_metal_frame.png', '/window_round_pane_lit.png', '/hand.png',
    '/red_keycard.png', '/blue_keycard.png', '/yellow_keycard.png', '/right_handed_crt.png'
  ]);

  useEffect(() => {
    // Make sure you add tCrt to the array being filtered here so it stays pixelated!
    [...woodTexList, ...stoneTexList, tFloorStone, tFloorWood, tDoorWood, tDoorMetal, tDoorMetalFrame, tWindow, tHand, tKeyRed, tKeyBlue, tKeyYellow, tCrt].forEach(t => {
      if(t) { t.magFilter = t.minFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; }
    });
    woodTexList.forEach(t => t.repeat.set(1, 3.2));
    stoneTexList.forEach(t => t.repeat.set(1, 3.2));
  }, [woodTexList, stoneTexList, tFloorStone, tFloorWood, tDoorWood, tDoorMetal, tDoorMetalFrame, tWindow, tHand, tKeyRed, tKeyBlue, tKeyYellow, tCrt]);

  const parsedData = useMemo(() => {
    const dummy = new THREE.Object3D();
    
    const wWallsBuffs = woodTexList.map(() => createBuffer());
    const sWallsBuffs = stoneTexList.map(() => createBuffer());
    const wFloorBuff = createBuffer();
    const sFloorBuff = createBuffer();
    const ceilBuff = createBuffer();
    
    const interactives = [];
    let totalFloors = 0;

    for (let fIdx = 0; fIdx < grids.length; fIdx++) {
      const grid = grids[fIdx];
      if (!grid) continue;
      
      const isWoodFloor = fIdx < 2;
      const wLen = woodTexList.length;
      const sLen = stoneTexList.length;
      const rows = grid.length;
      const cols = grid[0].length;
      const baseY = fIdx * FLOOR_HT;

      for (let z = 0; z < rows; z++) {
        for (let x = 0; x < cols; x++) {
          const tile = grid[z][x];
          
          if (tile === 1) {
            let isVisible = false;
            if (z > 0 && grid[z-1][x] !== 1) isVisible = true;
            else if (z < rows - 1 && grid[z+1][x] !== 1) isVisible = true;
            else if (x > 0 && grid[z][x-1] !== 1) isVisible = true;
            else if (x < cols - 1 && grid[z][x+1] !== 1) isVisible = true;

            if (isVisible) {
              const tIdx = (x * 7 + z * 13 + fIdx * 3) % (isWoodFloor ? wLen : sLen);
              dummy.position.set(x + 0.5, baseY + (FLOOR_HT / 2), z + 0.5);
              dummy.rotation.set(0, 0, 0);
              dummy.scale.set(1, 1, 1);
              if (isWoodFloor) wWallsBuffs[tIdx].add(dummy); else sWallsBuffs[tIdx].add(dummy);
            }
            continue; 
          }

          if (![3,10].includes(tile) && tile !== 6) {
            dummy.position.set(x + 0.5, baseY + FLOOR_HT - 0.02, z + 0.5);
            dummy.rotation.set(Math.PI / 2, 0, 0);
            dummy.scale.set(1, 1, 1);
            ceilBuff.add(dummy);
          }

          if (![3,10].includes(tile)) {
            totalFloors++;
            if (totalFloors > 1500000) return { error: "TOO_MANY_FLOORS", count: totalFloors };
            
            dummy.position.set(x + 0.5, baseY, z + 0.5);
            dummy.rotation.set(-Math.PI / 2, 0, 0);
            dummy.scale.set(1, 1, 1);
            if (isWoodFloor) wFloorBuff.add(dummy); else sFloorBuff.add(dummy);
          }

          // Added 32 and 38 to generate door meshes
          if ([2, 8, 12, 18, 22, 28, 7, 17, 32, 38].includes(tile)) {
            const tIdx = (x * 7 + z * 13 + fIdx * 3) % (isWoodFloor ? wLen : sLen);
            const lintelHt = FLOOR_HT - 2.0;
            dummy.position.set(x + 0.5, baseY + 2.0 + (lintelHt/2), z + 0.5);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(1, lintelHt / FLOOR_HT, 1); 
            if (isWoodFloor) wWallsBuffs[tIdx].add(dummy); else sWallsBuffs[tIdx].add(dummy);
          }

          if ([2, 8, 12, 18, 22, 28, 7, 17, 3, 10, 4, 5, 15, 25, 6, 32, 38].includes(tile)) {
            interactives.push({ tile, x, z, fIdx, baseY });
            if (interactives.length > 5000) return { error: "TOO_MANY_ENTITIES", count: interactives.length };
          }
        }
      }
    }

    return { 
      wWallsFinal: wWallsBuffs.map(b => b.finalize()), 
      sWallsFinal: sWallsBuffs.map(b => b.finalize()), 
      wFloorFinal: wFloorBuff.finalize(), 
      sFloorFinal: sFloorBuff.finalize(), 
      ceilFinal: ceilBuff.finalize(), 
      interactiveElements: interactives 
    };
  }, [grids, woodTexList.length, stoneTexList.length]);

  if (parsedData.error === "TOO_MANY_FLOORS" || parsedData.error === "TOO_MANY_ENTITIES") {
    return (
      <Html center position={[initialSpawn[0], initialSpawn[1], initialSpawn[2] - 2]} zIndexRange={[100, 0]}>
        <div style={{ backgroundColor: '#18181b', color: '#f87171', border: '4px solid #dc2626', padding: '2rem', fontFamily: 'monospace', textAlign: 'center', width: '400px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>FATAL RENDER ERROR</h2>
          <p style={{ margin: '0 0 1rem 0' }}>The engine safely aborted the render because it exceeded maximum memory allocation.</p>
        </div>
      </Html>
    );
  }

  const { wWallsFinal, sWallsFinal, wFloorFinal, sFloorFinal, ceilFinal, interactiveElements } = parsedData;

  return (
    <>
      <FastInstancedMesh geometryArgs={{type: 'box', args: [1, FLOOR_HT, 1]}} materialProps={{map: woodTexList[0], color: "#ffffff", roughness: 0.9}} bufferData={wWallsFinal[0]} />
      <FastInstancedMesh geometryArgs={{type: 'box', args: [1, FLOOR_HT, 1]}} materialProps={{map: woodTexList[1], color: "#ffffff", roughness: 0.9}} bufferData={wWallsFinal[1]} />
      <FastInstancedMesh geometryArgs={{type: 'box', args: [1, FLOOR_HT, 1]}} materialProps={{map: woodTexList[2], color: "#ffffff", roughness: 0.9}} bufferData={wWallsFinal[2]} />
      <FastInstancedMesh geometryArgs={{type: 'box', args: [1, FLOOR_HT, 1]}} materialProps={{map: woodTexList[3], color: "#ffffff", roughness: 0.9}} bufferData={wWallsFinal[3]} />
      
      <FastInstancedMesh geometryArgs={{type: 'box', args: [1, FLOOR_HT, 1]}} materialProps={{map: stoneTexList[0], color: "#ffffff", roughness: 0.9}} bufferData={sWallsFinal[0]} />
      <FastInstancedMesh geometryArgs={{type: 'box', args: [1, FLOOR_HT, 1]}} materialProps={{map: stoneTexList[1], color: "#ffffff", roughness: 0.9}} bufferData={sWallsFinal[1]} />
      <FastInstancedMesh geometryArgs={{type: 'box', args: [1, FLOOR_HT, 1]}} materialProps={{map: stoneTexList[2], color: "#ffffff", roughness: 0.9}} bufferData={sWallsFinal[2]} />
      <FastInstancedMesh geometryArgs={{type: 'box', args: [1, FLOOR_HT, 1]}} materialProps={{map: stoneTexList[3], color: "#ffffff", roughness: 0.9}} bufferData={sWallsFinal[3]} />

      <FastInstancedMesh geometryArgs={{type: 'plane', args: [1, 1]}} materialProps={{map: tFloorWood, color: "#ffffff", roughness: 1.0}} bufferData={wFloorFinal} />
      <FastInstancedMesh geometryArgs={{type: 'plane', args: [1, 1]}} materialProps={{map: tFloorStone, color: "#ffffff", roughness: 1.0}} bufferData={sFloorFinal} />
      <FastInstancedMesh geometryArgs={{type: 'plane', args: [1, 1]}} materialProps={{map: tFloorStone, color: "#71717a", roughness: 0.9, side: THREE.DoubleSide}} bufferData={ceilFinal} />

      {interactiveElements.map((el, idx) => {
        const { tile, x, z, fIdx, baseY } = el;
        const wTexList = fIdx < 2 ? woodTexList : stoneTexList;
        const wTex = wTexList[(x * 7 + z * 13 + fIdx * 3) % wTexList.length];
        const dTex = fIdx < 2 ? tDoorWood : tDoorMetal;
        
        // Add 32 and 38 to the inclusion check
        if ([2,8,12,18,22,28,7,17,32,38].includes(tile)) {
          let trimColor = "#dc2626";
          if (tile === 12 || tile === 18) trimColor = "#2563eb";
          if (tile === 22 || tile === 28) trimColor = "#eab308";
          
          // Apply the neutral trim to BOTH Gray and Light Gray doors
          if (tile === 7 || tile === 17 || tile === 32 || tile === 38) trimColor = "#a1a1aa"; 
          
          // Pass 38 into the isOpened array!
          return <DoorMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} grid={grids[fIdx]} gx={x} gz={z} isOpened={[8,18,28,17,38].includes(tile)} wallTexture={wTex} doorTexture={dTex} trimColor={trimColor} />;
        }
        
        if (tile === 3 || tile === 10) return <ElevatorMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} grid={grids[fIdx]} gx={x} gz={z} isOpened={tile === 10} wallTexture={wTex} doorTexture={tDoorMetalFrame} litTexture={tWindow} />;
       // Replace the old Terminal line with this one:
       if (tile === 4) return <TerminalMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tCrt} />;

        if (tile === 5) return <KeycardMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tKeyRed} color="#8B0000" />;
        if (tile === 15) return <KeycardMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tKeyBlue} color="#00008B" />;
        if (tile === 25) return <KeycardMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tKeyYellow} color="#B8860B" />;
        
        if (tile === 6) return <CeilingLightMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tWindow} />;
        return null;
      })}
      
      <PlayerControls grids={grids} handTexture={tHand} onInteract={onInteract} teleportCoords={teleportCoords} clearTeleport={clearTeleport} onFloorChange={onFloorChange} onEnterElevator={onEnterElevator} />
    </>
  );
}

export default function DungeonEngine({ grids, initialSpawn, onInteract, teleportCoords, clearTeleport, onFloorChange, onEnterElevator }) {
  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas camera={{ position: initialSpawn || [5.5, 0.8, 5.5], fov: 80, near: 0.01, far: 50 }} gl={{ antialias: false }}>
        <fog attach="fog" args={['#000000', 4, 18]} />
        <ambientLight intensity={1.0} color="#ffffff" />
        <Suspense fallback={null}>
          <DungeonScene grids={grids} initialSpawn={initialSpawn} onInteract={onInteract} teleportCoords={teleportCoords} clearTeleport={clearTeleport} onFloorChange={onFloorChange} onEnterElevator={onEnterElevator} />
        </Suspense>
      </Canvas>
    </div>
  );
}