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
    <instancedMesh ref={meshRef} args={[null, null, bufferData.count]} frustumCulled={true}>
      {geometryArgs.type === 'box' ? <boxGeometry args={geometryArgs.args} /> : <planeGeometry args={geometryArgs.args} />}
      <meshLambertMaterial {...materialProps} />
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
      {/* Scale widened to 2.4 and Y lowered to 0.65 so the legs rest firmly on the tiles */}
      <sprite ref={crtRef} position={[0, 0.65, 0]} scale={[2.4, 1.5, 1]}>
        <spriteMaterial map={texture} color="#ffffff" transparent={true} alphaTest={0.5} />
      </sprite>
      <pointLight color="#22c55e" intensity={1.5} distance={3} decay={2} position={[0, 0.8, 0]} />
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

  // Split the texture down the middle
  const texLeft = useMemo(() => {
    if (!doorTexture) return null;
    const tex = doorTexture.clone();
    tex.repeat.set(0.5, 1);
    tex.offset.set(0, 0);
    tex.needsUpdate = true;
    return tex;
  }, [doorTexture]);

  const texRight = useMemo(() => {
    if (!doorTexture) return null;
    const tex = doorTexture.clone();
    tex.repeat.set(0.5, 1);
    tex.offset.set(0.5, 0);
    tex.needsUpdate = true;
    return tex;
  }, [doorTexture]);
  
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
        <mesh ref={leftDoor} position={[-0.25, 1.0, 0]}><boxGeometry args={[0.5, 2.0, 0.05]} /><meshStandardMaterial map={texLeft} roughness={0.5} emissive="#ffffff" emissiveMap={texLeft} emissiveIntensity={0.25} /></mesh>
        <mesh ref={rightDoor} position={[0.25, 1.0, 0]}><boxGeometry args={[0.5, 2.0, 0.05]} /><meshStandardMaterial map={texRight} roughness={0.5} emissive="#ffffff" emissiveMap={texRight} emissiveIntensity={0.25} /></mesh>
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
function LightOrb({ projObj, startPos, dir, projectilesRef, grid, texture }) {
  const groupRef = useRef();
  const spriteRef = useRef();
  const materialRef = useRef();

  useEffect(() => { 
    projObj.mesh = groupRef; 
    if (groupRef.current) groupRef.current.position.copy(startPos);
  }, [projObj, startPos]);

  useFrame((state, delta) => {
    if (!projObj.active || !groupRef.current) return;

    const currentDist = groupRef.current.position.distanceTo(startPos);
    
    if (materialRef.current) {
      materialRef.current.rotation += delta * 15; 
    }

    if (spriteRef.current) {
      const distanceScale = Math.max(0.3, 1.0 - (currentDist / 20) * 0.7);
      const pulse = Math.sin(state.clock.elapsedTime * 40) * 0.08;
      const finalScale = distanceScale + pulse;
      
      spriteRef.current.scale.set(finalScale, finalScale, 1);
    }

    groupRef.current.position.add(dir.clone().multiplyScalar(15 * delta));
    
    const curX = groupRef.current.position.x;
    const curY = groupRef.current.position.y;
    const curZ = groupRef.current.position.z;
    
    const isSolid = grid && [1, 2, 12, 22, 7, 3, 4, 32, 50, 51, 52, 53, 54, 55, 56].includes(grid[Math.floor(curZ)]?.[Math.floor(curX)]);

    const floorY = Math.floor(startPos.y / FLOOR_HT) * FLOOR_HT;
    const ceilY = floorY + FLOOR_HT;
    const hitVertical = curY <= floorY + 0.1 || curY >= ceilY - 0.1;

    if (isSolid || hitVertical || currentDist > 20) {
      projObj.active = false;
      groupRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef}>
      <sprite ref={spriteRef} position={[0, -0.1, 0]} scale={[1.0, 1.0, 1]}>
        <spriteMaterial ref={materialRef} map={texture || undefined} color="#ffffff" transparent={true} />
      </sprite>
      <pointLight color="#a3e635" intensity={2.0} distance={5} decay={2} />
    </group>
  );
}

function EnemyOrb({ startPos, dir, onPlayerHit, grid, texture }) {
  const groupRef = useRef();
  const spriteRef = useRef(); 
  const materialRef = useRef(); 
  const { camera } = useThree();
  const isActive = useRef(true);

  useEffect(() => {
    if (groupRef.current) groupRef.current.position.copy(startPos);
  }, [startPos]);

  useFrame((state, delta) => {
    if (!isActive.current || !groupRef.current) return;

    if (spriteRef.current && materialRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 40) * 0.1;
      const baseScale = 1.5;
      spriteRef.current.scale.set(baseScale + pulse, baseScale + pulse, 1);
      materialRef.current.rotation += delta * 15;
    }

    groupRef.current.position.add(dir.clone().multiplyScalar(15 * delta));
    
    const curX = groupRef.current.position.x;
    const curZ = groupRef.current.position.z;
    
    const isSolid = grid && [1, 2, 12, 22, 7, 3, 4, 32].includes(grid[Math.floor(curZ)]?.[Math.floor(curX)]);
    
    if (groupRef.current.position.distanceTo(camera.position) < 0.8) {
      onPlayerHit();
      isActive.current = false;
      groupRef.current.visible = false;
      return;
    }

    if (isSolid || groupRef.current.position.distanceTo(startPos) > 20) {
      isActive.current = false;
      groupRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef}>
      <sprite ref={spriteRef} position={[0, 0, 0]} scale={[1.5, 1.5, 1]}>
        <spriteMaterial ref={materialRef} map={texture || undefined} color="#ffffff" transparent={true} />
      </sprite>
      <pointLight color="#22c55e" intensity={2.0} distance={5} decay={2} />
    </group>
  );
}

function BossNPC({ initialPos, playerCamera, projectilesRef, onEradicate, onPlayerHit, grid, onSpawnEnemyOrb, texture, playSFX }) {
  const groupRef = useRef();
  const spriteMaterialRef = useRef();
  const isDead = useRef(false);
  const deathTime = useRef(0);
  const hasAggroed = useRef(false); 
  
  const hp = useRef(25); 
  const lastShot = useRef(0);

  const bossTex = useMemo(() => {
    if (!texture) return null;
    const tex = texture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    // Hell Knight is a single row of 7 frames[cite: 30]
    tex.repeat.set(1/7, 1); 
    tex.magFilter = THREE.NearestFilter; 
    tex.needsUpdate = true;
    return tex;
  }, [texture]);

  // ... (Keep your existing checkLoS function inside here) ...
  const checkLoS = (startX, startZ, endX, endZ) => {
    if (!grid || isNaN(startX) || isNaN(startZ) || isNaN(endX) || isNaN(endZ)) return false;
    const dx = endX - startX; const dz = endZ - startZ;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist === 0) return true;
    const steps = Math.ceil(dist * 5); 
    const stepX = dx / steps; const stepZ = dz / steps;
    let curX = startX; let curZ = startZ;
    for (let i = 0; i <= steps; i++) {
      if ([1, 2, 12, 22, 7, 3, 4, 32].includes(grid[Math.floor(curZ)]?.[Math.floor(curX)])) return false;
      curX += stepX; curZ += stepZ;
    }
    return true;
  };
  
  useFrame((state, delta) => {
    if (!groupRef.current || !bossTex) return;

    if (isDead.current) {
      const timeSinceDeath = state.clock.elapsedTime - deathTime.current;
      bossTex.offset.x = 0; // Freeze on idle frame
      groupRef.current.position.y -= delta * 0.5; // Sink into the floor
      if (timeSinceDeath > 1.5) groupRef.current.visible = false;
      return;
    }
    
    const dx = groupRef.current.position.x - playerCamera.position.x;
    const dz = groupRef.current.position.z - playerCamera.position.z;
    const sqDist = dx * dx + dz * dz;
    const dist = Math.sqrt(sqDist);
    
    const hasLoS = checkLoS(groupRef.current.position.x, groupRef.current.position.z, playerCamera.position.x, playerCamera.position.z);
    const timeSinceShot = state.clock.elapsedTime - lastShot.current;

    if (sqDist > 400) hasAggroed.current = false;

    if (dist < 15 && hasLoS) {
      if (!hasAggroed.current) {
        hasAggroed.current = true;
        playSFX('sfx-boss', 1.0);
      }
      groupRef.current.lookAt(playerCamera.position.x, groupRef.current.position.y, playerCamera.position.z);
      
      if (timeSinceShot > 1.5) {
        lastShot.current = state.clock.elapsedTime;
        const dir = new THREE.Vector3().subVectors(playerCamera.position, groupRef.current.position).normalize();
        const spawnPos = groupRef.current.position.clone().add(dir.clone().multiplyScalar(0.8));
        spawnPos.y += 0.5; 
        onSpawnEnemyOrb({ id: Math.random(), startPos: spawnPos, dir });
      }

      if (dist > 1.5 && timeSinceShot > 0.6) {
        const dir = new THREE.Vector3().subVectors(playerCamera.position, groupRef.current.position).normalize();
        dir.y = 0; 
        const speed = 2.5 * delta; 
        const nextX = groupRef.current.position.x + dir.x * speed;
        const nextZ = groupRef.current.position.z + dir.z * speed;
        const radius = 0.6; 
        const isSolid = (x, z) => grid && [1, 2, 12, 22, 7, 3, 4, 32].includes(grid[Math.floor(z)]?.[Math.floor(x)]);

        if (!isSolid(nextX, groupRef.current.position.z) && !isSolid(nextX + (dir.x > 0 ? radius : -radius), groupRef.current.position.z)) {
          groupRef.current.position.x = nextX;
        }
        if (!isSolid(groupRef.current.position.x, nextZ) && !isSolid(groupRef.current.position.x, nextZ + (dir.z > 0 ? radius : -radius))) {
          groupRef.current.position.z = nextZ;
        }
      }
    }

    // Map the 7-frame horizontal sheet[cite: 30]
    if (timeSinceShot < 0.6) {
      // Attack Windup & Shoot Frames (2, 3, 4)
      if (timeSinceShot < 0.2) bossTex.offset.x = 2 * (1/7);
      else if (timeSinceShot < 0.4) bossTex.offset.x = 3 * (1/7);
      else bossTex.offset.x = 4 * (1/7);
    } else {
      // Walking Frames (0, 1, 5, 6)
      const walkFrames = [0, 1, 5, 6];
      const currentFrame = Math.floor(state.clock.elapsedTime * 6) % 4;
      bossTex.offset.x = walkFrames[currentFrame] * (1/7); 
    }

    projectilesRef.current.forEach(proj => {
      if (proj.active && proj.mesh?.current && groupRef.current.position.distanceTo(proj.mesh.current.position) < 1.5) {
        proj.active = false;            
        proj.mesh.current.visible = false;
        hp.current -= 1;
        
        if (spriteMaterialRef.current) {
          spriteMaterialRef.current.color.setHex(0xff0000);
          setTimeout(() => { if (spriteMaterialRef.current) spriteMaterialRef.current.color.setHex(0xffffff); }, 100);
        }

        if (hp.current <= 0 && !isDead.current) {
          isDead.current = true;
          deathTime.current = state.clock.elapsedTime;
          onEradicate(); 
        }
      }
    });
  });

  return (
    <group ref={groupRef} position={initialPos}>
      {/* Scaled down to 1.8x and repositioned so feet touch the ground */}
      <sprite position={[0, 0.4, 0]} scale={[1.8, 1.8, 1]}>
        <spriteMaterial ref={spriteMaterialRef} map={bossTex || undefined} color="#ffffff" transparent={true} alphaTest={0.5} />
      </sprite>
    </group>
  );
}

function ShadowNPC({ initialPos, playerCamera, projectilesRef, onEradicate, onPlayerHit, grid, texture, playSFX }) {
  const groupRef = useRef();
  const spriteMaterialRef = useRef();
  const isDead = useRef(false);
  const isChasing = useRef(false);
  const hasAggroed = useRef(false); 
  
  const hp = useRef(2);

  const impTex = useMemo(() => {
    if (!texture) return null;
    const tex = texture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    // Imp is a single row of exactly 6 frames[cite: 29]
    tex.repeat.set(1/6, 1); 
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, [texture]);

  // ... (Keep your existing checkLoS function inside here) ...
  const checkLoS = (startX, startZ, endX, endZ) => {
    if (!grid || isNaN(startX) || isNaN(startZ) || isNaN(endX) || isNaN(endZ)) return false;
    const dx = endX - startX; const dz = endZ - startZ;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist === 0) return true;
    const steps = Math.ceil(dist * 5); 
    const stepX = dx / steps; const stepZ = dz / steps;
    let curX = startX; let curZ = startZ;
    for (let i = 0; i <= steps; i++) {
      if ([1, 2, 12, 22, 7, 3, 4, 32].includes(grid[Math.floor(curZ)]?.[Math.floor(curX)])) return false;
      curX += stepX; curZ += stepZ;
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
    
    if (sqDist > 144) {
      isChasing.current = false;
      hasAggroed.current = false; 
    } else {
      const hasLoS = checkLoS(groupRef.current.position.x, groupRef.current.position.z, playerCamera.position.x, playerCamera.position.z);
      if (hasLoS) {
        isChasing.current = true;
        if (!hasAggroed.current) {
          hasAggroed.current = true;
          playSFX('sfx-imp', 1.0);
        }
      } else {
        isChasing.current = false;
      }
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
        const isSolid = (x, z) => grid && [1, 2, 12, 22, 7, 3, 4, 32].includes(grid[Math.floor(z)]?.[Math.floor(x)]);

        if (!isSolid(nextX, groupRef.current.position.z) && !isSolid(nextX + (dir.x > 0 ? radius : -radius), groupRef.current.position.z)) {
          groupRef.current.position.x = nextX;
        }
        if (!isSolid(groupRef.current.position.x, nextZ) && !isSolid(groupRef.current.position.x, nextZ + (dir.z > 0 ? radius : -radius))) {
          groupRef.current.position.z = nextZ;
        }

        // Loop through all 6 frames[cite: 29]
        if (impTex) {
          const walkFrame = Math.floor(state.clock.elapsedTime * 6) % 6;
          impTex.offset.x = walkFrame * (1/6);
        }

      } else {
        isDead.current = true;
        groupRef.current.visible = false;
        onPlayerHit();
      }
    } else {
       if (impTex) impTex.offset.x = 0;
    }
    
    projectilesRef.current.forEach(proj => {
      if (proj.active && proj.mesh?.current && groupRef.current.position.distanceTo(proj.mesh.current.position) < 1.0) {
        proj.active = false;            
        proj.mesh.current.visible = false;
        hp.current -= 1; 

        if (spriteMaterialRef.current) {
          spriteMaterialRef.current.color.setHex(0xff0000);
          setTimeout(() => { if (spriteMaterialRef.current) spriteMaterialRef.current.color.setHex(0xffffff); }, 100);
        }

        if (hp.current <= 0) {
          isDead.current = true;          
          groupRef.current.visible = false;
          onEradicate();
        }
      }
    });
  });

  return (
    <group ref={groupRef} position={initialPos}>
      {/* Scaled down to 1.4x and repositioned so feet touch the ground */}
      <sprite position={[0, 0.2, 0]} scale={[1.4, 1.4, 1]}>
        <spriteMaterial ref={spriteMaterialRef} map={impTex || undefined} color="#ffffff" transparent={true} alphaTest={0.5} />
      </sprite>
    </group>
  );
}

function CombatManager({ enemiesData, onEradicate, onPlayerHit, grids, bossTexture, orbTexture, playerProjTexture, impTexture, playSFX }) {
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
        
        playSFX('sfx-shoot', 0.6);
        
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
  }, [camera, playSFX]);

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
          texture={playerProjTexture} 
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
              playSFX={playSFX}
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
            texture={impTexture} 
            playSFX={playSFX}
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
        if (targetZ >= 0 && targetZ < grids[fIdx]?.length && targetX >= 0 && targetX < grids[fIdx][0]?.length) {
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

    const oldX = camera.position.x;
    const oldZ = camera.position.z;

    if (moveState.current.forward) controlsRef.current.moveForward(moveSpeed);
    if (moveState.current.backward) controlsRef.current.moveForward(-moveSpeed);
    if (moveState.current.right) controlsRef.current.moveRight(moveSpeed);
    if (moveState.current.left) controlsRef.current.moveRight(-moveSpeed);

    const newX = camera.position.x;
    const newZ = camera.position.z;
    const radius = 0.28;

    // Direct grid check including all props (50-56)
    const isSolidTile = (x, z) => {
      const gx = Math.floor(x);
      const gz = Math.floor(z);
      if (!grids || !grids[currentFIdx]) return true;
      const curGrid = grids[currentFIdx];
      if (gz < 0 || gz >= curGrid.length || gx < 0 || gx >= curGrid[0].length) return true;
      
      const tile = curGrid[gz][gx];
      const solidList = [1, 2, 12, 22, 7, 3, 4, 32, 50, 51, 52, 53, 54, 55, 56];
      if (solidList.includes(tile)) return true;

      // Desk (4), Lab Bench (50), and Chem Rack (56) spill horizontally into adjacent cells
      const wideTiles = [4, 50, 56];
      if (gx > 0 && wideTiles.includes(curGrid[gz]?.[gx - 1]) && (x - gx) < 0.35) return true;
      if (gx < curGrid[0].length - 1 && wideTiles.includes(curGrid[gz]?.[gx + 1]) && (gx + 1 - x) < 0.35) return true;

      return false;
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

    // Always keep hand locked to camera after movement is calculated
    if (handRef.current) {
      const handOffset = new THREE.Vector3(0.18, -0.15, -0.3);
      handOffset.applyQuaternion(camera.quaternion);
      handRef.current.position.copy(camera.position).add(handOffset);
      handRef.current.quaternion.copy(camera.quaternion);
      
      handRef.current.position.y += Math.abs(Math.sin(bobTime.current)) * 0.02 * bobAmp.current;
      handRef.current.rotation.z += Math.cos(bobTime.current / 2) * 0.02 * bobAmp.current; 
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
        <pointLight intensity={1.8} distance={15} color="#fffbeb" decay={1} />
      </mesh>
    </>
  );
}

// ----------------------------------------------------
// 5. MAIN SCENE RENDERING
// ----------------------------------------------------
function DungeonScene({ grids, initialSpawn, onInteract, teleportCoords, clearTeleport, onFloorChange, onEnterElevator, onPlayerMove, onEradicate, onPlayerHit, isPuzzleActive, playSFX }) {
  const [tWallLab, tWallContainment, tElevatorDoor, tFloorContainment, tFloorLab, tCeiling, tDoorWood, tDoorMetal, tDoorContainment, tLight, tHand, tKeyRed, tKeyBlue, tKeyYellow, tCrt, tBoss, tEnemyProj, tPlayerProj, tImp, tLabBench, tServerRack, tGas, tBioBarrel, tLabStool, tOfficeChair, tChemRack] = useTexture([
    '/lab_wall_tiles.png', '/containment_wall_tiles.png', '/elevator_door.png',
    '/containment_floor_tiles.png', '/lab_floor_tiles.png', 
    '/ceiling_tiles.png',
    '/door_wood.png', '/terminal_door.png', '/containment_door.png', '/ceiling_light.png', '/hand.png',
    '/red_keycard.png', '/blue_keycard.png', '/yellow_keycard.png', '/computer_terminal.png',
    '/Hell Knight.png', '/green projectile 2.png', '/hand_projectile 2.png', '/imp.png',
    '/lab_bench.png', '/server_rack.png', '/gas_containers.png', 
    '/biohazard_barrel.png', '/lab_stool.png', '/office_chair.png', '/chemical_rack.png'
  ]);

  useEffect(() => {
    [tWallLab, tWallContainment, tElevatorDoor, tFloorContainment, tFloorLab, tCeiling, tDoorWood, tDoorMetal, tDoorContainment, tLight, tHand, tKeyRed, tKeyBlue, tKeyYellow, tCrt, tBoss, tEnemyProj, tPlayerProj, tImp, tLabBench, tServerRack, tGas, tBioBarrel, tLabStool, tOfficeChair, tChemRack].forEach(t => {
      if(t) { 
        t.magFilter = t.minFilter = THREE.NearestFilter; 
        t.wrapS = t.wrapT = THREE.RepeatWrapping; 
        t.needsUpdate = true; 
      }
    });
    
    // Zoom in the flat surfaces to spread the tiles out
    if (tFloorLab) tFloorLab.repeat.set(0.25, 0.25);
    if (tFloorContainment) tFloorContainment.repeat.set(0.25, 0.25);
    if (tCeiling) tCeiling.repeat.set(0.25, 0.25);

    // Zoom in the walls and scale the Y-axis proportionally to the 3.2 height
    if (tWallLab) tWallLab.repeat.set(0.25, 0.8);
    if (tWallContainment) tWallContainment.repeat.set(0.25, 0.8);

  }, [tWallLab, tWallContainment, tElevatorDoor, tFloorContainment, tFloorLab, tCeiling, tDoorWood, tDoorMetal, tDoorContainment, tLight, tHand, tKeyRed, tKeyBlue, tKeyYellow, tCrt, tBoss, tEnemyProj, tPlayerProj, tImp, tLabBench, tServerRack, tGas, tBioBarrel, tLabStool, tOfficeChair, tChemRack]);
  
  // Pass currentFloor into useMemo dependency
  const parsedData = useMemo(() => {
    const dummy = new THREE.Object3D();
    
    const wWallBuff = createBuffer();
    const sWallBuff = createBuffer();
    const wFloorBuff = createBuffer();
    const sFloorBuff = createBuffer();
    const ceilBuff = createBuffer();
    
    const interactives = [];
    const decorations = []; 

    // ONLY process the floor the player is actually on
    const fIdx = currentFloor;
    const grid = grids[fIdx];
    if (grid) {
      const rows = grid.length;
      const cols = grid[0].length;
      const baseY = fIdx * FLOOR_HT;
      const isStoneZone = fIdx > 0;

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
              dummy.position.set(x + 0.5, baseY + (FLOOR_HT / 2), z + 0.5);
              dummy.rotation.set(0, 0, 0);
              dummy.scale.set(1, 1, 1);
              if (isStoneZone) sWallBuff.add(dummy); else wWallBuff.add(dummy);
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
            if (isStoneZone) sWallBuff.add(dummy); else wWallBuff.add(dummy);
          }

          if ([2, 8, 9, 13, 12, 18, 22, 28, 7, 17, 3, 10, 4, 5, 15, 25, 6, 32, 38].includes(tile)) {
            interactives.push({ tile, x, z, fIdx, baseY, isStoneZone });
          }

          if ([50, 51, 52, 53, 54, 55, 56].includes(tile)) {
            decorations.push({ tile, x, z, fIdx, baseY });
          }
        }
      }
    }

    return { 
      wWallFinal: wWallBuff.finalize(), 
      sWallFinal: sWallBuff.finalize(), 
      wFloorFinal: wFloorBuff.finalize(), 
      sFloorFinal: sFloorBuff.finalize(), 
      ceilFinal: ceilBuff.finalize(), 
      interactiveElements: interactives,
      decorations 
    };
  }, [grids, currentFloor]);

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

  const { wWallFinal, sWallFinal, wFloorFinal, sFloorFinal, ceilFinal, interactiveElements, decorations } = parsedData;

  const enemiesData = useMemo(() => {
    return interactiveElements
      .filter(el => el.tile === 9 || el.tile === 13)
      .map(el => ({ pos: [el.x + 0.5, el.baseY + 0.5, el.z + 0.5], fIdx: el.fIdx, type: el.tile }));
  }, [interactiveElements]);

  return (
    <>
      <FastInstancedMesh geometryArgs={{type: 'box', args: [1, FLOOR_HT, 1]}} materialProps={{map: tWallLab, color: "#ffffff", roughness: 0.9}} bufferData={wWallFinal} />
      <FastInstancedMesh geometryArgs={{type: 'box', args: [1, FLOOR_HT, 1]}} materialProps={{map: tWallContainment, color: "#ffffff", roughness: 0.9}} bufferData={sWallFinal} />

      <FastInstancedMesh geometryArgs={{type: 'plane', args: [1, 1]}} materialProps={{map: tFloorLab, color: "#ffffff", roughness: 1.0}} bufferData={wFloorFinal} />
      <FastInstancedMesh geometryArgs={{type: 'plane', args: [1, 1]}} materialProps={{map: tFloorContainment, color: "#ffffff", roughness: 1.0}} bufferData={sFloorFinal} />
      <FastInstancedMesh geometryArgs={{type: 'plane', args: [1, 1]}} materialProps={{map: tCeiling, color: "#ffffff"}} bufferData={ceilFinal} />
      {interactiveElements.map((el, idx) => {
        const { tile, x, z, fIdx, baseY, isStoneZone } = el;
        
        const wTex = isStoneZone ? tWallContainment : tWallLab; 
        
        // Use the terminal door by default, and containment door for Yellow Keycard zones
        let dTex = tDoorMetal; 
        if (tile === 22 || tile === 28) dTex = tDoorContainment;
        
        if ([2,8,12,18,22,28,7,17,32,38].includes(tile)) {
          let trimColor = "#dc2626";
          if (tile === 12 || tile === 18) trimColor = "#2563eb";
          if (tile === 22 || tile === 28) trimColor = "#eab308";
          
          if (tile === 7 || tile === 17 || tile === 32 || tile === 38) trimColor = "#a1a1aa"; 
          
          return <DoorMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} grid={grids[fIdx]} gx={x} gz={z} isOpened={[8,18,28,17,38].includes(tile)} wallTexture={wTex} doorTexture={dTex} trimColor={trimColor} />;
        }
        // Change doorTexture={tDoorMetal} to doorTexture={tElevatorDoor}
        if (tile === 3 || tile === 10) return <ElevatorMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} grid={grids[fIdx]} gx={x} gz={z} isOpened={tile === 10} wallTexture={wTex} doorTexture={tElevatorDoor} litTexture={tLight} />;
        if (tile === 4) return <TerminalMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tCrt} />;

        if (tile === 5) return <KeycardMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tKeyRed} color="#8B0000" />;
        if (tile === 15) return <KeycardMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tKeyBlue} color="#00008B" />;
        if (tile === 25) return <KeycardMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tKeyYellow} color="#B8860B" />;
        
        if (tile === 6) return <CeilingLightMesh key={`int-${idx}`} position={[x + 0.5, baseY, z + 0.5]} texture={tLight} />;
        return null;
      })}

{decorations.map((dec, idx) => {
        let tex = null;
        let scale = [1, 1, 1];
        let yOffset = 0.5;
        
        if (dec.tile === 50) { tex = tLabBench; scale = [2.2, 1.4, 1]; yOffset = 0.65; }
        else if (dec.tile === 51) { tex = tServerRack; scale = [1.2, 2.0, 1]; yOffset = 0.95; }
        else if (dec.tile === 52) { tex = tGas; scale = [1.2, 1.5, 1]; yOffset = 0.7; }
        else if (dec.tile === 53) { tex = tBioBarrel; scale = [0.9, 1.2, 1]; yOffset = 0.55; }
        else if (dec.tile === 54) { tex = tLabStool; scale = [0.7, 0.9, 1]; yOffset = 0.4; }
        else if (dec.tile === 55) { tex = tOfficeChair; scale = [1.2, 1.5, 1]; yOffset = 0.55; } // Lowered from 0.9 to 0.55
        else if (dec.tile === 56) { tex = tChemRack; scale = [1.5, 2.0, 1]; yOffset = 0.95; }

        return (
          <group key={`dec-${idx}`} position={[dec.x + 0.5, dec.baseY + yOffset, dec.z + 0.5]}>
            <sprite scale={scale}>
              <spriteMaterial map={tex} color="#ffffff" transparent={true} alphaTest={0.5} />
            </sprite>
          </group>
        );
      })}

      <CombatManager 
        enemiesData={enemiesData} 
        grids={grids} 
        onEradicate={onEradicate} 
        onPlayerHit={onPlayerHit} 
        bossTexture={tBoss} 
        orbTexture={tEnemyProj} 
        playerProjTexture={tPlayerProj} 
        impTexture={tImp} 
        playSFX={playSFX}
      />
      <PlayerControls grids={grids} handTexture={tHand} onInteract={onInteract} teleportCoords={teleportCoords} clearTeleport={clearTeleport} onFloorChange={onFloorChange} onEnterElevator={onEnterElevator} onPlayerMove={onPlayerMove} isPuzzleActive={isPuzzleActive} />
    </>
  );
}

export default function DungeonEngine({ grids, initialSpawn, onInteract, teleportCoords, clearTeleport, onFloorChange, onEnterElevator, onPlayerMove, onEradicate, onPlayerHit, isPuzzleActive, currentFloor, playSFX }) {
  
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
        <DungeonScene grids={grids} 
        initialSpawn={initialSpawn}
        onInteract={onInteract}
        teleportCoords={teleportCoords}
        clearTeleport={clearTeleport}
        onFloorChange={onFloorChange}
        onEnterElevator={onEnterElevator}
        onPlayerMove={onPlayerMove}
        onEradicate={onEradicate}
        onPlayerHit={onPlayerHit}
        isPuzzleActive={isPuzzleActive}
        playSFX={playSFX}
        currentFloor={currentFloor} />
        </Suspense>
      </Canvas>
    </div>
  );
}