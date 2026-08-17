'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { FLOORS } from '@/lib/mapData';

const DungeonEngine = dynamic(() => import('@/components/DungeonEngine'), { ssr: false });

export default function EscapeRoomPage() {
  const [currentFloor, setCurrentFloor] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [showElevatorMenu, setShowElevatorMenu] = useState(false);
  const [teleportCoords, setTeleportCoords] = useState(null);
  
  const [grids, setGrids] = useState([FLOORS[0].grid, FLOORS[1].grid, FLOORS[2].grid]);

  const triggerMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleInteract = (tileType, x, z, fIdx) => {
    const openDoor = (targetType) => {
      const newGrids = [...grids];
      newGrids[fIdx] = grids[fIdx].map((row, rIdx) =>
        row.map((col, cIdx) => (rIdx === z && cIdx === x ? targetType : col))
      );
      setGrids(newGrids);
    };

    const pickupKey = (keyName) => {
      triggerMessage(`ACQUIRED ${keyName}`);
      setInventory([...inventory, keyName]);
      openDoor(0); // Removes key from grid
    };

    // Doors
    if (tileType === 2) {
      if (inventory.includes('RED KEYCARD')) { triggerMessage("ACCESS GRANTED"); openDoor(8); }
      else triggerMessage("LOCKED - RED KEYCARD REQUIRED");
    }
    if (tileType === 12) {
      if (inventory.includes('BLUE KEYCARD')) { triggerMessage("ACCESS GRANTED"); openDoor(18); }
      else triggerMessage("LOCKED - BLUE KEYCARD REQUIRED");
    }
    if (tileType === 22) {
      if (inventory.includes('YELLOW KEYCARD')) { triggerMessage("ACCESS GRANTED"); openDoor(28); }
      else triggerMessage("LOCKED - YELLOW KEYCARD REQUIRED");
    }

    // Keys
    if (tileType === 5) pickupKey('RED KEYCARD');
    if (tileType === 15) pickupKey('BLUE KEYCARD');
    if (tileType === 25) pickupKey('YELLOW KEYCARD');

    // Terminals / Elevator
    if (tileType === 4) triggerMessage("SYSTEM TERMINAL: SECURITY OVERRIDE ACTIVE");
    if (tileType === 3) { triggerMessage("ELEVATOR DOORS OPENING"); openDoor(10); }
    if (tileType === 10) { document.exitPointerLock(); setShowElevatorMenu(true); }
  };

  const handleElevatorSelect = (targetFloorIndex) => {
    setTeleportCoords({ x: 2.5, y: targetFloorIndex * 4 + 0.8, z: 2.5 });
    setShowElevatorMenu(false);
    triggerMessage(`ELEVATOR TRANSIT: FLOOR E1M${targetFloorIndex + 1}`);
    const newGrids = grids.map(grid => grid.map(row => row.map(cell => cell === 10 ? 3 : cell)));
    setGrids(newGrids);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black font-mono select-none">
      {!gameStarted ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-red-600">
          <div className="border-4 border-stone-700 bg-stone-900 p-8 text-center max-w-md">
            <h1 className="text-4xl font-extrabold mb-1 tracking-widest text-red-600">OFFICE DUNGEON</h1>
            <p className="mb-8 text-stone-300 text-xs">Use WASD to run. Mouse to look. 'E' to interact.</p>
            <button onClick={() => setGameStarted(true)} className="w-full py-3 bg-red-700 hover:bg-red-600 text-black font-extrabold">
              START ESCAPE
            </button>
          </div>
        </div>
      ) : (
        <>
          <DungeonEngine
            grids={grids}
            onInteract={handleInteract}
            teleportCoords={teleportCoords}
            clearTeleport={() => setTeleportCoords(null)}
            onFloorChange={(f) => setCurrentFloor(f)}
          />

          {showElevatorMenu && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-stone-900 border-4 border-yellow-600 p-8 w-96 text-center">
                <h2 className="text-yellow-500 text-2xl font-black mb-6 tracking-widest">ELEVATOR SYSTEM</h2>
                <div className="flex flex-col gap-4">
                  {[0, 1, 2].map((f) => (
                    <button key={f} onClick={() => handleElevatorSelect(f)} className="bg-stone-800 hover:bg-yellow-600 hover:text-black text-yellow-500 border-2 border-stone-600 py-3 font-bold uppercase transition-colors">
                      E1M{f + 1} - {FLOORS[f]?.name.split('-')[1] || "Sector"}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowElevatorMenu(false)} className="mt-6 text-stone-400 text-xs hover:text-white">
                  [ CANCEL ]
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-40 bg-stone-950 text-yellow-400 border-2 border-yellow-600 px-6 py-2 text-sm font-bold pointer-events-none uppercase">
              {message}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 z-40 bg-stone-900 border-t-4 border-stone-600 p-2 flex items-center justify-between text-stone-200 h-20 pointer-events-none">
            <div className="bg-stone-950 border-2 border-stone-700 px-4 py-1 flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-[10px] text-stone-500 font-bold">LEVEL</span>
              <span className="text-red-500 font-black mt-1">E1M{currentFloor + 1}</span>
            </div>

            <div className="hidden md:flex bg-stone-950 border-2 border-stone-700 px-6 py-2 flex-col items-center justify-center flex-1 mx-4">
              <span className="text-[10px] text-stone-500 font-bold">CURRENT SECTOR</span>
              <span className="text-xs font-bold text-yellow-500 mt-0.5">{FLOORS[currentFloor]?.name || "Unknown"}</span>
            </div>

            <div className="bg-stone-950 border-2 border-stone-700 px-4 py-1 flex flex-col items-center justify-center min-w-[180px]">
              <span className="text-[10px] text-stone-500 font-bold">INVENTORY</span>
              <div className="flex gap-3 mt-1">
                {inventory.length === 0 ? <span className="text-xs text-stone-600">NONE</span> : 
                  inventory.map((item, idx) => {
                    let imgSrc = '';
                    if (item === 'RED KEYCARD') imgSrc = '/red_keycard_mini.png';
                    if (item === 'BLUE KEYCARD') imgSrc = '/blue_keycard_mini.png';
                    if (item === 'YELLOW KEYCARD') imgSrc = '/yellow_keycard_mini.png';
                    return <img key={idx} src={imgSrc} alt={item} className="h-6 w-auto object-contain" style={{ imageRendering: 'pixelated' }} />;
                  })
                }
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}