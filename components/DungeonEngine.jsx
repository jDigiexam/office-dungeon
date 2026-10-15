'use client';

import React, { useRef, useEffect, useMemo, Suspense, useState } from 'react';
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
        cardRef.current.rotation.y += safeDelta * 2.0; 
        
        if (cardRef.current.position.y < 0.4) {
          cardRef.current.position.y = THREE.MathUtils.lerp(cardRef.current.position.y, 0.45, safeDelta * 4.0);
          if (cardRef.current.position.y >= 0.4) cardRef.current.position.y = 0.4;
        }
      } 
    });
    
    return (
      <group position={position}>
        <mesh ref={cardRef} position={[0, -1.0, 0]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshStandardMaterial map={texture} emissive={color} emissiveIntensity={0.8} transparent={true} side={THREE.DoubleSide} alphaTest={0.5} />
        </mesh>
      </group>
    );
}

function TerminalMesh({ position, texture }) {
    const crtRef = useRef();
    
    useFrame(({ camera }) => { 
      if (crtRef.current) crtRef.current.lookAt(camera.position); 
    });
    
    return (
      <group position={position}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.5, 0.8, 0.5]} />
          <meshStandardMaterial color="#808080" roughness={0.9} />
        </mesh>
        <mesh ref={crtRef} position={[0, 1.1, 0]}>
          <planeGeometry args={[0.7, 0.7]} />
          <meshStandardMaterial map={texture} emissive="#ffffff" emissiveMap={texture} emissiveIntensity={0.6} transparent={true} side={THREE.DoubleSide} alphaTest={0.5} />
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
// COMBAT & HORROR SYSTEM
// ----------------------------------------------------
// 🚨 UPDATED: Player Projectile Component (Spinning Orb Technique)
function LightOrb({ projObj, startPos, dir, projectilesRef, grid, texture }) {
  const groupRef = useRef();
  const spriteRef = useRef();
  const materialRef = useRef(); // 🚨 NEW: Reference to directly rotate the sprite material
  const impactTime = useRef(null);

  const projTex = useMemo(() => {
    if (!texture) return null;
    const tex = texture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1/10, 1); 
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, [texture]);
  
  useEffect(() => { 
    projObj.mesh = groupRef; 
    if (groupRef.current) groupRef.current.position.copy(startPos);
  }, [projObj, startPos]);

  useFrame((state, delta) => {
    if (!projObj.active || !groupRef.current) return;

    // IMPACT ANIMATION
    if (impactTime.current !== null) {
      const timeSinceImpact = state.clock.elapsedTime - impactTime.current;
      const impactFrame = 6 + Math.floor(timeSinceImpact * 20);
      
      if (impactFrame > 9) {
        projObj.active = false;
        groupRef.current.visible = false;
        return;
      }
      
      if (projTex) projTex.offset.x = impactFrame * (1/10);
      // Stop the spinning when it hits a wall
      if (materialRef.current) materialRef.current.rotation = 0; 
      return; 
    }

    const currentDist = groupRef.current.position.distanceTo(startPos);

    // 🚨 FIX: Lock to Frame 0 (the perfect orb) 
    if (projTex) {
      projTex.offset.x = 0; 
    }
    
    // 🚨 FIX: Rapidly spin the 2D material on the Z-axis to simulate crackling energy
    if (materialRef.current) {
      materialRef.current.rotation += delta * 15; 
    }

    if (spriteRef.current) {
      const distanceScale = Math.max(0.3, 1.0 - (currentDist / 20) * 0.7);
      // 🚨 FIX: Add a rapid, tiny math-based pulse to make it feel unstable and alive
      const pulse = Math.sin(state.clock.elapsedTime * 40) * 0.08;
      const finalScale = distanceScale + pulse;
      
      spriteRef.current.scale.set(finalScale, finalScale, 1);
    }

    groupRef.current.position.add(dir.clone().multiplyScalar(15 * delta));
    
    const curX = groupRef.current.position.x;
    const curY = groupRef.current.position.y;
    const curZ = groupRef.current.position.z;
    
    const isSolid = grid && [1, 2, 12, 22, 7, 3, 4, 32].includes(grid[Math.floor(curZ)]?.[Math.floor(curX)]);

    const floorY = Math.floor(startPos.y / FLOOR_HT) * FLOOR_HT;
    const ceilY = floorY + FLOOR_HT;
    const hitVertical = curY <= floorY + 0.1 || curY >= ceilY - 0.1;

    if (isSolid || hitVertical || currentDist > 20) {
      impactTime.current = state.clock.elapsedTime;
    }
  });

  return (
    <group ref={groupRef}>
      <sprite ref={spriteRef} position={[0, -0.1, 0]} scale={[1.0, 1.0, 1]}>
        {/* 🚨 Attached the materialRef so we can spin it */}
        <spriteMaterial ref={materialRef} map={projTex || undefined} color="#ffffff" transparent={true} />
      </sprite>
      <pointLight color="#a3e635" intensity={2.0} distance={5} decay={2} />
    </group>
  );
}

// 🚨 UPDATED: 2.5D Enemy Projectile Component (Spinning + Pulsating Fix)
function EnemyOrb({ startPos, dir, onPlayerHit, grid, texture }) {
  const groupRef = useRef();
  const spriteRef = useRef(); // 🚨 NEW: For scale pulsing
  const materialRef = useRef(); // 🚨 NEW: For rotation
  const { camera } = useThree();
  const isActive = useRef(true);
  const impactTime = useRef(null);

  const projTex = useMemo(() => {
    if (!texture) return null;
    const tex = texture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    // 11 total frames in the sprite sheet
    tex.repeat.set(1/11, 1); 
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, [texture]);

  useEffect(() => {
    if (groupRef.current) groupRef.current.position.copy(startPos);
  }, [startPos]);

  useFrame((state, delta) => {
    if (!isActive.current || !groupRef.current) return;
    
    // IMPACT ANIMATION
    if (impactTime.current !== null) {
      const timeSinceImpact = state.clock.elapsedTime - impactTime.current;
      const impactFrameIndex = 8 + Math.floor(timeSinceImpact * 15);
      
      if (impactFrameIndex > 10) {
        isActive.current = false;
        groupRef.current.visible = false;
        return;
      }
      
      if (projTex) projTex.offset.x = impactFrameIndex * (1/11);
      if (materialRef.current) materialRef.current.rotation = 0; 
      return; 
    }

    // 2.5D FLIGHT LOGIC
    if (projTex && spriteRef.current && materialRef.current) {
      const camDir = new THREE.Vector3().subVectors(camera.position, groupRef.current.position).normalize();
      const dot = dir.dot(camDir);
      
      // Add the rapid, tiny math-based pulse to make it feel unstable
      const pulse = Math.sin(state.clock.elapsedTime * 40) * 0.1;
      const baseScale = 1.5;
      spriteRef.current.scale.set(baseScale + pulse, baseScale + pulse, 1);

      if (dot > 0.7) {
        // Straight-on: Lock to Frame 0 and spin
        projTex.offset.x = 0;
        materialRef.current.rotation += delta * 15;
      } else {
        // Side shot: Lock to Frame 2 (clean side profile) and keep horizontal
        projTex.offset.x = 2 * (1/11);
        materialRef.current.rotation = 0; 
      }
    }

    groupRef.current.position.add(dir.clone().multiplyScalar(15 * delta));
    
    const curX = groupRef.current.position.x;
    const curZ = groupRef.current.position.z;
    
    const isSolid = grid && [1, 2, 12, 22, 7, 3, 4, 32].includes(grid[Math.floor(curZ)]?.[Math.floor(curX)]);
    
    if (groupRef.current.position.distanceTo(camera.position) < 0.8) {
      onPlayerHit();
      impactTime.current = state.clock.elapsedTime; 
      return;
    }

    if (isSolid || groupRef.current.position.distanceTo(startPos) > 20) {
      impactTime.current = state.clock.elapsedTime; 
    }
  });

  return (
    <group ref={groupRef}>
      <sprite ref={spriteRef} position={[0, 0, 0]} scale={[1.5, 1.5, 1]}>
        <spriteMaterial ref={materialRef} map={projTex || undefined} color="#ffffff" transparent={true} />
      </sprite>
      <pointLight color="#22c55e" intensity={2.0} distance={5} decay={2} />
    </group>
  );
}

function BossNPC({ initialPos, playerCamera, projectilesRef, onEradicate, onPlayerHit, grid, onSpawnEnemyOrb, texture }) {
  const groupRef = useRef();
  const spriteMaterialRef = useRef();
  const isDead = useRef(false);
  const deathTime = useRef(0);
  
  const hp = useRef(25); 
  const lastShot = useRef(0);

  const bossTex = useMemo(() => {
    if (!texture) return null;
    const tex = texture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1/8, 1/7); 
    tex.magFilter = THREE.NearestFilter; 
    tex.needsUpdate = true;
    return tex;
  }, [texture]);

  const checkLoS = (startX, startZ, endX, endZ) => {
    if (!grid || isNaN(startX) || isNaN(startZ) || isNaN(endX) || isNaN(endZ)) return false;
    let x0 = Math.floor(startX);
    let z0 = Math.floor(startZ);
    const x1 = Math.floor(endX);
    const z1 = Math.floor(endZ);
    const dx = Math.abs(x1 - x0);
    const dz = -Math.abs(z1 - z0);
    let sx = x0 < x1 ? 1 : -1;
    let sz = z0 < z1 ? 1 : -1;
    let err = dx + dz;

    let loopLimit = 30; 
    while (loopLimit-- > 0) {
      if ([1, 2, 12, 22, 7, 3, 4, 32].includes(grid[z0]?.[x0])) return false;
      if (x0 === x1 && z0 === z1) break;
      const e2 = 2 * err;
      if (e2 >= dz) { err += dz; x0 += sx; }
      if (e2 <= dx) { err += dx; z0 += sz; }
    }
    return true;
  };
  
  useFrame((state, delta) => {
    if (!groupRef.current || !bossTex) return;

    if (isDead.current) {
      const timeSinceDeath = state.clock.elapsedTime - deathTime.current;
      const deathFrameIndex = Math.min(Math.floor(timeSinceDeath * 8), 6); 
      
      bossTex.offset.y = 0;
      bossTex.offset.x = deathFrameIndex * (1/8);

      if (timeSinceDeath > 1.5) {
        groupRef.current.visible = false;
      }
      return;
    }
    
    const dx = groupRef.current.position.x - playerCamera.position.x;
    const dz = groupRef.current.position.z - playerCamera.position.z;
    const sqDist = dx * dx + dz * dz;
    const dist = Math.sqrt(sqDist);
    
    const hasLoS = checkLoS(groupRef.current.position.x, groupRef.current.position.z, playerCamera.position.x, playerCamera.position.z);
    
    const timeSinceShot = state.clock.elapsedTime - lastShot.current;

    if (dist < 15 && hasLoS) {
      groupRef.current.lookAt(playerCamera.position.x, groupRef.current.position.y, playerCamera.position.z);
      
      // 🚨 FIX: Greatly increased boss fire rate (every 1.2s instead of 2.5s)
      if (timeSinceShot > 1.2) {
        lastShot.current = state.clock.elapsedTime;
        const dir = new THREE.Vector3().subVectors(playerCamera.position, groupRef.current.position).normalize();
        
        const spawnPos = groupRef.current.position.clone().add(dir.clone().multiplyScalar(0.8));
        spawnPos.y += 0.5; 
        onSpawnEnemyOrb({ id: Math.random(), startPos: spawnPos, dir });
      }

      if (dist > 1.5) {
        const dir = new THREE.Vector3().subVectors(playerCamera.position, groupRef.current.position).normalize();
        dir.y = 0; 
        const speed = 2.5 * delta; 
        
        const nextX = groupRef.current.position.x + dir.x * speed;
        const nextZ = groupRef.current.position.z + dir.z * speed;
        const radius = 0.6; 

        const isSolid = (x, z) => {
          if (!grid) return true;
          return [1, 2, 12, 22, 7, 3, 4, 32].includes(grid[Math.floor(z)]?.[Math.floor(x)]);
        };

        if (!isSolid(nextX, groupRef.current.position.z) && !isSolid(nextX + (dir.x > 0 ? radius : -radius), groupRef.current.position.z)) {
          groupRef.current.position.x = nextX;
        }
        if (!isSolid(groupRef.current.position.x, nextZ) && !isSolid(groupRef.current.position.x, nextZ + (dir.z > 0 ? radius : -radius))) {
          groupRef.current.position.z = nextZ;
        }
      }
    }

    if (timeSinceShot < 0.3) {
      bossTex.offset.x = 0; 
      bossTex.offset.y = 2 * (1/7); 
    } else {
      const walkFrames = [6, 5, 4, 3];
      const currentFrame = Math.floor(state.clock.elapsedTime * 6) % 4;
      bossTex.offset.x = 0; 
      bossTex.offset.y = walkFrames[currentFrame] * (1/7); 
    }

    projectilesRef.current.forEach(proj => {
      if (proj.active && proj.mesh?.current) {
        if (groupRef.current.position.distanceTo(proj.mesh.current.position) < 1.5) {
          proj.active = false;            
          proj.mesh.current.visible = false;
          hp.current -= 1;
          
          if (spriteMaterialRef.current) {
            spriteMaterialRef.current.color.setHex(0xff0000);
            setTimeout(() => { 
              if (spriteMaterialRef.current) spriteMaterialRef.current.color.setHex(0xffffff); 
            }, 100);
          }

          if (hp.current <= 0 && !isDead.current) {
            isDead.current = true;
            deathTime.current = state.clock.elapsedTime;
            onEradicate(); 
          }
        }
      }
    });
  });

  return (
    <group ref={groupRef} position={initialPos}>
      <sprite position={[0, 0.75, 0]} scale={[2.5, 2.5, 1]}>
        <spriteMaterial ref={spriteMaterialRef} map={bossTex || undefined} color="#ffffff" transparent={true} />
      </sprite>
    </group>
  );
}

function ShadowNPC({ initialPos, playerCamera, projectilesRef, onEradicate, onPlayerHit, grid }) {
  const groupRef = useRef();
  const ghostBody = useRef();
  const leftArm = useRef();
  const rightArm = useRef();
  const leftLeg = useRef();
  const rightLeg = useRef();
  const isDead = useRef(false);
  const isChasing = useRef(false);
  
  const hp = useRef(2); 

  const checkLoS = (startX, startZ, endX, endZ) => {
    if (!grid || isNaN(startX) || isNaN(startZ) || isNaN(endX) || isNaN(endZ)) return false;
    let x0 = Math.floor(startX);
    let z0 = Math.floor(startZ);
    const x1 = Math.floor(endX);
    const z1 = Math.floor(endZ);
    const dx = Math.abs(x1 - x0);
    const dz = -Math.abs(z1 - z0);
    let sx = x0 < x1 ? 1 : -1;
    let sz = z0 < z1 ? 1 : -1;
    let err = dx + dz;

    let loopLimit = 30; 
    while (loopLimit-- > 0) {
      if ([1, 2, 12, 22, 7, 3, 4, 32].includes(grid[z0]?.[x0])) return false;
      if (x0 === x1 && z0 === z1) break;
      const e2 = 2 * err;
      if (e2 >= dz) { err += dz; x0 += sx; }
      if (e2 <= dx) { err += dx; z0 += sz; }
    }
    return true;
  };

  useFrame((state, delta) => {
    if (isDead.current || !groupRef.current) return;
    
    const yDist = Math.abs(groupRef.current.position.y - playerCamera.position.y);
    if (yDist > 3.0) return;

    const dx = groupRef.current.position.x - playerCamera.position.x;
    const dz = groupRef.current.position.z - playerCamera.position.z;
    const sqDist = dx * dx + dz * dz;
    
    if (sqDist > 64) {
      isChasing.current = false;
    } else {
      const hasLoS = checkLoS(groupRef.current.position.x, groupRef.current.position.z, playerCamera.position.x, playerCamera.position.z);
      if (hasLoS) isChasing.current = true;
    }

    const safeDelta = Math.min(delta, 0.1);
    const dist = Math.sqrt(sqDist);
    
    if (isChasing.current) {
      if (dist > 0.6) {
        groupRef.current.lookAt(playerCamera.position.x, groupRef.current.position.y, playerCamera.position.z);
        const dir = new THREE.Vector3().subVectors(playerCamera.position, groupRef.current.position).normalize();
        dir.y = 0; 

        const speed = 3.0 * safeDelta;
        const nextX = groupRef.current.position.x + dir.x * speed;
        const nextZ = groupRef.current.position.z + dir.z * speed;
        const radius = 0.3; 

        const isSolid = (x, z) => {
          if (!grid) return true;
          return [1, 2, 12, 22, 7, 3, 4, 32].includes(grid[Math.floor(z)]?.[Math.floor(x)]);
        };

        if (!isSolid(nextX, groupRef.current.position.z) && !isSolid(nextX + (dir.x > 0 ? radius : -radius), groupRef.current.position.z)) {
          groupRef.current.position.x = nextX;
        }
        if (!isSolid(groupRef.current.position.x, nextZ) && !isSolid(groupRef.current.position.x, nextZ + (dir.z > 0 ? radius : -radius))) {
          groupRef.current.position.z = nextZ;
        }

        if (ghostBody.current) {
          ghostBody.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.08;
        }

        const t = state.clock.elapsedTime * 8;
        if (leftArm.current) leftArm.current.rotation.x = Math.sin(t) * 0.7;
        if (rightArm.current) rightArm.current.rotation.x = -Math.sin(t) * 0.7;
        if (leftLeg.current) leftLeg.current.rotation.x = -Math.sin(t) * 0.7;
        if (rightLeg.current) rightLeg.current.rotation.x = Math.sin(t) * 0.7;

      } else if (dist <= 0.6) {
        isDead.current = true;
        groupRef.current.visible = false;
        onPlayerHit();
      }
    } else {
       if (leftArm.current) leftArm.current.rotation.x = 0;
       if (rightArm.current) rightArm.current.rotation.x = 0;
       if (leftLeg.current) leftLeg.current.rotation.x = 0;
       if (rightLeg.current) rightLeg.current.rotation.x = 0;
    }
    
    projectilesRef.current.forEach(proj => {
      if (proj.active && proj.mesh?.current) {
        if (groupRef.current.position.distanceTo(proj.mesh.current.position) < 1.0) {
          proj.active = false;            
          proj.mesh.current.visible = false;
          
          hp.current -= 1; 
          if (hp.current <= 0) {
            isDead.current = true;          
            groupRef.current.visible = false;
            onEradicate();
          }
        }
      }
    });
  });

  return (
    <group ref={groupRef} position={initialPos}>
      <group ref={ghostBody}>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.9} />
        </mesh>
        
        <mesh position={[0.1, 1.65, 0.21]}>
          <sphereGeometry args={[0.035]} />
          <meshStandardMaterial color="#eb1414" emissive="#eb1414" emissiveIntensity={5} />
        </mesh>
        <mesh position={[-0.1, 1.65, 0.21]}>
          <sphereGeometry args={[0.035]} />
          <meshStandardMaterial color="#eb1414" emissive="#eb1414" emissiveIntensity={5} />
        </mesh>

        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.2, 0.8, 0.15]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.9} />
        </mesh>

        <group ref={leftArm} position={[-0.18, 1.35, 0]}>
          <mesh position={[0, -0.6, 0]}>
            <boxGeometry args={[0.08, 1.2, 0.08]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.9} />
          </mesh>
        </group>

        <group ref={rightArm} position={[0.18, 1.35, 0]}>
          <mesh position={[0, -0.6, 0]}>
            <boxGeometry args={[0.08, 1.2, 0.08]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.9} />
          </mesh>
        </group>

        <group ref={leftLeg} position={[-0.07, 0.6, 0]}>
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[0.08, 1.0, 0.08]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.9} />
          </mesh>
        </group>

        <group ref={rightLeg} position={[0.07, 0.6, 0]}>
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[0.08, 1.0, 0.08]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function CombatManager({ enemiesData, onEradicate, onPlayerHit, grids, bossTexture, orbTexture, playerProjTexture }) {
  const { camera } = useThree();
  const projectilesRef = useRef([]);
  const [projectiles, setProjectiles] = useState([]);
  const [enemyProjectiles, setEnemyProjectiles] = useState([]);
  
  const currentFIdx = Math.max(0, Math.min(2, Math.round(camera.position.y / FLOOR_HT)));

  useEffect(() => {
    const handleShoot = (e) => {
      const isSpacebar = e.type === 'keydown' && e.code === 'Space';
      const isLeftClick = e.type === 'mousedown' && e.button === 0;

      if ((isSpacebar || isLeftClick) && document.pointerLockElement) {
        if (isSpacebar) e.preventDefault(); 
        
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const newProj = { id: Math.random(), startPos: camera.position.clone(), dir, active: true, mesh: null };
        projectilesRef.current.push(newProj);
        setProjectiles(prev => [...prev, newProj]); 
      }
    };

    window.addEventListener('mousedown', handleShoot);
    window.addEventListener('keydown', handleShoot);
    
    return () => {
      window.removeEventListener('mousedown', handleShoot);
      window.removeEventListener('keydown', handleShoot);
    };
  }, [camera]);

  return (
    <>
      {projectiles.map(p => (
        <LightOrb 
          key={`orb-${p.id}`} 
          projObj={p} 
          startPos={p.startPos} 
          dir={p.dir} 
          projectilesRef={projectilesRef} 
          grid={grids?.[currentFIdx]} 
          texture={playerProjTexture} // 🚨 Pass the texture here
        />
      ))}
      {enemyProjectiles.map(ep => (
        <EnemyOrb 
          key={`e-orb-${ep.id}`} 
          startPos={ep.startPos} 
          dir={ep.dir} 
          onPlayerHit={onPlayerHit} 
          grid={grids?.[currentFIdx]} 
          texture={orbTexture}
        />
      ))}
      {enemiesData.map((e, idx) => {
        if (e.type === 13) {
          return (
            <BossNPC 
              key={`boss-${idx}`} 
              initialPos={e.pos} 
              playerCamera={camera} 
              projectilesRef={projectilesRef} 
              onEradicate={() => onEradicate(true)} 
              onPlayerHit={onPlayerHit}
              grid={grids?.[e.fIdx]} 
              onSpawnEnemyOrb={(orb) => setEnemyProjectiles(prev => [...prev, orb])}
              texture={bossTexture}
            />
          );
        }
        
        return (
          <ShadowNPC 
            key={`enemy-${idx}`} 
            initialPos={e.pos} 
            playerCamera={camera} 
            projectilesRef={projectilesRef} 
            onEradicate={() => onEradicate(false)} 
            onPlayerHit={onPlayerHit}
            grid={grids?.[e.fIdx]} 
          />
        );
      })}
    </>
  );
}

// ----------------------------------------------------
// 4. CONTROLS
// ----------------------------------------------------
function PlayerControls({ grids, handTexture, onInteract, teleportCoords, clearTeleport, onFloorChange, onEnterElevator, onPlayerMove, isPuzzleActive }) {
  const controlsRef = useRef();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const currentFloorRef = useRef(0);
  const elevatorDebounce = useRef(false);
  const lastPos = useRef({ x: -1, z: -1 });
  
  const bobTime = useRef(0);
  const bobAmp = useRef(0); 
  const handRef = useRef();
  
  const { camera } = useThree();

  useEffect(() => {
    if (teleportCoords) {
      camera.position.set(teleportCoords.x, teleportCoords.y, teleportCoords.z);
      currentFloorRef.current = Math.max(0, Math.min(2, Math.round(teleportCoords.y / FLOOR_HT)));
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
      if (!document.pointerLockElement) return;

      const key = e.key.toLowerCase();
      if (key === 'w') moveState.current.forward = true;
      if (key === 's') moveState.current.backward = true;
      if (key === 'a') moveState.current.left = true;
      if (key === 'd') moveState.current.right = true;

      if (key === 'e') {
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

    const currentMapTile = grids[currentFIdx]?.[Math.floor(camera.position.z)]?.[Math.floor(camera.position.x)];
    if (currentMapTile === 10 && !elevatorDebounce.current) {
      elevatorDebounce.current = true;
      onEnterElevator(currentFIdx);
      setTimeout(() => { elevatorDebounce.current = false; }, 2000);
    }

    const curX = Math.floor(camera.position.x);
    const curZ = Math.floor(camera.position.z);
    if (curX !== lastPos.current.x || curZ !== lastPos.current.z) {
      lastPos.current.x = curX;
      lastPos.current.z = curZ;
      if (onPlayerMove) onPlayerMove(curX, curZ);
    }
  });

  return (
    <>
      <PointerLockControls 
        makeDefault 
        ref={controlsRef} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI * 3 / 4} 
        selector="#engine-wrapper"
      />
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
function DungeonScene({ grids, initialSpawn, onInteract, teleportCoords, clearTeleport, onFloorChange, onEnterElevator, onPlayerMove, onEradicate, onPlayerHit, isPuzzleActive }) {
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

  // 🚨 Add tPlayerProj to the end of the destructuring and useTexture array
  const [tFloorStone, tFloorWood, tDoorWood, tDoorMetal, tDoorMetalFrame, tWindow, tHand, tKeyRed, tKeyBlue, tKeyYellow, tCrt, tBoss, tEnemyProj, tPlayerProj] = useTexture([
    '/floor_stone_pattern.png', '/floor_tiles_tan_large.png', '/door_wood.png', '/door_metal_gate.png',
    '/door_metal_frame.png', '/window_round_pane_lit.png', '/hand.png',
    '/red_keycard.png', '/blue_keycard.png', '/yellow_keycard.png', '/right_handed_crt.png',
    '/Hell Knight.png', '/green projectile 2.png', '/hand_projectile 2.png'
  ]);

  useEffect(() => {
    [...woodTexList, ...stoneTexList, tFloorStone, tFloorWood, tDoorWood, tDoorMetal, tDoorMetalFrame, tWindow, tHand, tKeyRed, tKeyBlue, tKeyYellow, tCrt, tBoss, tEnemyProj, tPlayerProj].forEach(t => {
      if(t) { t.magFilter = t.minFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; }
    });
    woodTexList.forEach(t => t.repeat.set(1, 3.2));
    stoneTexList.forEach(t => t.repeat.set(1, 3.2));
    
    if (tEnemyProj) {
      tEnemyProj.repeat.set(1/11, 1); 
    }
    // 🚨 Configure the player projectile sprite framing
    if (tPlayerProj) {
      tPlayerProj.repeat.set(1/10, 1);
    }
  }, [woodTexList, stoneTexList, tFloorStone, tFloorWood, tDoorWood, tDoorMetal, tDoorMetalFrame, tWindow, tHand, tKeyRed, tKeyBlue, tKeyYellow, tCrt, tBoss, tEnemyProj, tPlayerProj]);

  const parsedData = useMemo(() => {
    const dummy = new THREE.Object3D();
    
    const wWallsBuffs = woodTexList.slice(0, 4).map(() => createBuffer());
    const sWallsBuffs = stoneTexList.slice(0, 4).map(() => createBuffer());
    const wFloorBuff = createBuffer();
    const sFloorBuff = createBuffer();
    const ceilBuff = createBuffer();
    
    const interactives = [];
    let totalFloors = 0;

    for (let fIdx = 0; fIdx < grids.length; fIdx++) {
      const grid = grids[fIdx];
      if (!grid) continue;
      
      const rows = grid.length;
      const cols = grid[0].length;
      const baseY = fIdx * FLOOR_HT;

      for (let z = 0; z < rows; z++) {
        for (let x = 0; x < cols; x++) {
          const tile = grid[z][x];
          
          let isStoneZone = fIdx > 0;
          let tIdx = 0;

          if (fIdx === 0) {
            if (z > 55) {
              isStoneZone = true;
              tIdx = (x + z) % 4; 
            } else if (z > 25) {
              isStoneZone = false;
              tIdx = (x % 2 === 0) ? 0 : 1; 
            } else {
              isStoneZone = false;
              tIdx = (z % 2 === 0) ? 3 : 2; 
            }
          } else {
            tIdx = (x * 7 + z * 13) % 4; 
          }

          if (tile === 1) {
            let isVisible = false;
            if (z > 0 && grid[z-1][x] !== 1) isVisible = true;
            else if (z < rows - 1 && grid[z+1][x] !== 1) isVisible = true;
            else if (x > 0 && grid[z][x-1] !== 1) isVisible = true;
            else if (x < cols - 1 && grid[z][x+1] !== 1) isVisible = true;

            if (isVisible) {
              dummy.position.set(x + 0.5, baseY + (FLOOR_HT / 2), z + 0.5);
              dummy.rotation.set(0, 0, 0);
              dummy.scale.set(1, 1, 1);
              if (isStoneZone) sWallsBuffs[tIdx].add(dummy); else wWallsBuffs[tIdx].add(dummy);
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
            if (isStoneZone) sFloorBuff.add(dummy); else wFloorBuff.add(dummy);
          }

          if ([2, 8, 12, 18, 22, 28, 7, 17, 32, 38].includes(tile)) {
            const lintelHt = FLOOR_HT - 2.0;
            dummy.position.set(x + 0.5, baseY + 2.0 + (lintelHt/2), z + 0.5);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(1, lintelHt / FLOOR_HT, 1); 
            if (isStoneZone) sWallsBuffs[tIdx].add(dummy); else wWallsBuffs[tIdx].add(dummy);
          }

          if ([2, 8, 9, 13, 12, 18, 22, 28, 7, 17, 3, 10, 4, 5, 15, 25, 6, 32, 38].includes(tile)) {
            interactives.push({ tile, x, z, fIdx, baseY, isStoneZone, tIdx });
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

  const enemiesData = useMemo(() => {
    return interactiveElements
      .filter(el => el.tile === 9 || el.tile === 13)
      .map(el => ({ pos: [el.x + 0.5, el.baseY + 0.5, el.z + 0.5], fIdx: el.fIdx, type: el.tile }));
  }, [interactiveElements]);

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
        const { tile, x, z, fIdx, baseY, isStoneZone, tIdx } = el;
        
        const wTexList = isStoneZone ? stoneTexList : woodTexList;
        const wTex = wTexList[tIdx]; 
        const dTex = isStoneZone ? tDoorMetal : tDoorWood;
        
        if ([2,8,12,18,22,28,7,17,32,38].includes(tile)) {
          let trimColor = "#dc2626";
          if (tile === 12 || tile === 18) trimColor = "#2563eb";
          if (tile === 22 || tile === 28) trimColor = "#eab308";
          
          if (tile === 7 || tile === 17 || tile === 32 || tile === 38) trimColor = "#a1a1aa"; 
          
          return <DoorMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} grid={grids[fIdx]} gx={x} gz={z} isOpened={[8,18,28,17,38].includes(tile)} wallTexture={wTex} doorTexture={dTex} trimColor={trimColor} />;
        }
        
        if (tile === 3 || tile === 10) return <ElevatorMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} grid={grids[fIdx]} gx={x} gz={z} isOpened={tile === 10} wallTexture={wTex} doorTexture={tDoorMetalFrame} litTexture={tWindow} />;
        if (tile === 4) return <TerminalMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tCrt} />;

        if (tile === 5) return <KeycardMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tKeyRed} color="#8B0000" />;
        if (tile === 15) return <KeycardMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tKeyBlue} color="#00008B" />;
        if (tile === 25) return <KeycardMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tKeyYellow} color="#B8860B" />;
        
        if (tile === 6) return <CeilingLightMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tWindow} />;
        return null;
      })}
      
      {/* 🚨 Pass the new tPlayerProj texture into playerProjTexture */}
      <CombatManager enemiesData={enemiesData} grids={grids} onEradicate={onEradicate} onPlayerHit={onPlayerHit} bossTexture={tBoss} orbTexture={tEnemyProj} playerProjTexture={tPlayerProj} />
      <PlayerControls grids={grids} handTexture={tHand} onInteract={onInteract} teleportCoords={teleportCoords} clearTeleport={clearTeleport} onFloorChange={onFloorChange} onEnterElevator={onEnterElevator} onPlayerMove={onPlayerMove} isPuzzleActive={isPuzzleActive} />
    </>
  );
}

export default function DungeonEngine({ grids, initialSpawn, onInteract, teleportCoords, clearTeleport, onFloorChange, onEnterElevator, onPlayerMove, onEradicate, onPlayerHit, isPuzzleActive, currentFloor }) {
  
  const isHell = currentFloor === 2;
  const fogColor = isHell ? '#450a0a' : '#000000';
  const fogFar = isHell ? 12 : 18; 
  const lightColor = isHell ? '#ef4444' : '#ffffff';
  const lightIntensity = isHell ? 0.3 : 1.0;

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas camera={{ position: initialSpawn || [5.5, 0.8, 5.5], fov: 80, near: 0.01, far: 50 }} gl={{ antialias: false }}>
        <fog attach="fog" args={[fogColor, 4, fogFar]} />
        <ambientLight intensity={lightIntensity} color={lightColor} />
        
        <Suspense fallback={null}>
        <DungeonScene grids={grids} initialSpawn={initialSpawn} onInteract={onInteract} teleportCoords={teleportCoords} clearTeleport={clearTeleport} onFloorChange={onFloorChange} onEnterElevator={onEnterElevator} onPlayerMove={onPlayerMove} onEradicate={onEradicate} onPlayerHit={onPlayerHit} isPuzzleActive={isPuzzleActive} />
        </Suspense>
      </Canvas>
    </div>
  );
}