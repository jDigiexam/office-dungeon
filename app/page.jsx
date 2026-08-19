'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { loadMapFromImage } from '@/lib/mapParser';
import { TERMINAL_PUZZLES } from '@/lib/puzzleData';

const DungeonEngine = dynamic(() => import('@/components/DungeonEngine'), { ssr: false });

const FALLBACK_GRID = Array(10).fill(Array(10).fill(0)).map((row, z) => 
  row.map((col, x) => (x === 0 || x === 9 || z === 0 || z === 9 ? 1 : 0))
);

export default function EscapeRoomPage() {
  const [currentFloor, setCurrentFloor] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [teleportCoords, setTeleportCoords] = useState(null);
  
  const [grids, setGrids] = useState(null);
  const [spawnCoords, setSpawnCoords] = useState([5.5, 0.8, 5.5]);
  const [mapsLoading, setMapsLoading] = useState(true);

  const [activePuzzle, setActivePuzzle] = useState(null);
  const [solvedPuzzles, setSolvedPuzzles] = useState([]);
  const [puzzleInput, setPuzzleInput] = useState('');
  const [puzzleError, setPuzzleError] = useState('');

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const floor0 = await loadMapFromImage('/map_floor_0.png').catch(() => ({ grid: FALLBACK_GRID, spawnPoint: null }));
        const floor1 = await loadMapFromImage('/map_floor_1.png').catch(() => ({ grid: FALLBACK_GRID, spawnPoint: null }));
        const floor2 = await loadMapFromImage('/map_floor_2.png').catch(() => ({ grid: FALLBACK_GRID, spawnPoint: null }));

        setGrids([floor0.grid, floor1.grid, floor2.grid]);
        if (floor0.spawnPoint) setSpawnCoords(floor0.spawnPoint);
        setMapsLoading(false);
      } catch (err) {
        console.error("Failed to load map images", err);
        setGrids([FALLBACK_GRID, FALLBACK_GRID, FALLBACK_GRID]);
        setMapsLoading(false);
      }
    };
    fetchMaps();
  }, []);

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
      openDoor(0); 
    };

    // 🚨 NEW: Standard door logic (Gray) opens instantly without a keycard
    if (tileType === 7) { triggerMessage("DOOR OPENED"); openDoor(17); }

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

    if (tileType === 5) pickupKey('RED KEYCARD');
    if (tileType === 15) pickupKey('BLUE KEYCARD');
    if (tileType === 25) pickupKey('YELLOW KEYCARD');

    if (tileType === 4) {
      const puzzleKey = `${fIdx}_${x}_${z}`;
      if (solvedPuzzles.includes(puzzleKey)) { triggerMessage("TERMINAL ALREADY OVERRIDDEN."); return; }

      const puzzleData = TERMINAL_PUZZLES[puzzleKey];
      if (puzzleData) {
        document.exitPointerLock();
        setActivePuzzle({ ...puzzleData, key: puzzleKey });
        setPuzzleInput(''); setPuzzleError('');
      } else {
        triggerMessage("TERMINAL OFFLINE. NO DATA FOUND.");
      }
    }

    if (tileType === 3) { triggerMessage("ELEVATOR DOORS OPENING"); openDoor(10); }
  };

  // 🚨 NEW: Automatic Elevator Teleport Function
  const handleEnterElevator = (fIdx) => {
    const targetFloor = fIdx + 1;
    if (targetFloor >= grids.length || !grids[targetFloor]) {
      triggerMessage("MAXIMUM FLOOR REACHED");
      return;
    }
    
    // Safely drop the player on the first Walkable Floor (0) found on the next level
    let safeTransit = { x: 2.5, y: targetFloor * 3.2 + 0.8, z: 2.5 };
    let found = false;
    for (let z = 0; z < grids[targetFloor].length; z++) {
      for (let x = 0; x < grids[targetFloor][z].length; x++) {
        if (grids[targetFloor][z][x] === 0) {
          safeTransit = { x: x + 0.5, y: targetFloor * 3.2 + 0.8, z: z + 0.5 };
          found = true; break;
        }
      }
      if (found) break;
    }

    setTeleportCoords(safeTransit);
    triggerMessage(`ELEVATOR TRANSIT: FLOOR E1M${targetFloor + 1}`);
    
    // Auto-close the elevator doors on the old floor behind the player
    const newGrids = [...grids];
    newGrids[fIdx] = grids[fIdx].map(row => row.map(cell => cell === 10 ? 3 : cell));
    setGrids(newGrids);
  };

  const handlePuzzleSubmit = (submittedAnswer) => {
    const isCorrect = submittedAnswer.toString().toLowerCase().trim() === activePuzzle.answer.toString().toLowerCase().trim();
    if (isCorrect) {
      const { reward } = activePuzzle;
      const newGrids = [...grids];
      newGrids[reward.fIdx] = grids[reward.fIdx].map((row, rIdx) =>
        row.map((col, cIdx) => (rIdx === reward.z && cIdx === reward.x ? reward.newTile : col))
      );
      setGrids(newGrids);
      setSolvedPuzzles([...solvedPuzzles, activePuzzle.key]);
      triggerMessage(activePuzzle.successMessage);
      setActivePuzzle(null);
    } else {
      setPuzzleError('INCORRECT CREDENTIALS OR ANSWER.');
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black font-mono select-none">
      {!gameStarted ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-red-600">
          <div className="border-4 border-stone-700 bg-stone-900 p-8 text-center max-w-md">
            <h1 className="text-4xl font-extrabold mb-1 tracking-widest text-red-600">OFFICE DUNGEON</h1>
            <p className="mb-8 text-stone-300 text-xs">Use WASD to run. Mouse to look. 'E' to interact.</p>
            {mapsLoading ? (
              <button disabled className="w-full py-3 bg-stone-700 text-stone-500 font-extrabold animate-pulse">
                INITIALIZING SATELLITE LINK...
              </button>
            ) : (
              <button onClick={() => setGameStarted(true)} className="w-full py-3 bg-red-700 hover:bg-red-600 text-black font-extrabold">
                START ESCAPE
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <DungeonEngine
            grids={grids}
            initialSpawn={spawnCoords}
            onInteract={handleInteract}
            teleportCoords={teleportCoords}
            clearTeleport={() => setTeleportCoords(null)}
            onFloorChange={(f) => setCurrentFloor(f)}
            onEnterElevator={handleEnterElevator}
          />

          {activePuzzle && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-stone-900 border-4 border-emerald-600 p-8 w-[600px] max-w-[90vw] shadow-2xl shadow-emerald-900/20">
                <div className="flex justify-between items-center mb-6 border-b-2 border-stone-700 pb-4">
                  <h2 className="text-emerald-500 text-xl font-black tracking-widest">{activePuzzle.title}</h2>
                  <span className="text-stone-500 text-xs animate-pulse">AWAITING INPUT...</span>
                </div>
                <p className="text-stone-200 text-lg mb-8 leading-relaxed">{activePuzzle.question}</p>
                {activePuzzle.type === 'multiple-choice' ? (
                  <div className="flex flex-col gap-3">
                    {activePuzzle.options.map((opt, i) => (
                      <button key={i} onClick={() => handlePuzzleSubmit(opt)} className="bg-stone-800 hover:bg-emerald-600 hover:text-black text-emerald-500 border-2 border-stone-600 py-3 px-4 font-bold transition-colors text-left">
                        &gt; {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <input 
                      type="text" 
                      value={puzzleInput}
                      onChange={(e) => { setPuzzleInput(e.target.value); setPuzzleError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handlePuzzleSubmit(puzzleInput)}
                      className="w-full bg-black border-2 border-stone-600 text-emerald-400 p-4 font-mono text-lg focus:border-emerald-500 outline-none"
                      placeholder="ENTER RESPONSE..."
                      autoFocus
                    />
                    <button onClick={() => handlePuzzleSubmit(puzzleInput)} className="bg-emerald-700 hover:bg-emerald-500 text-black py-3 font-extrabold uppercase w-full tracking-widest transition-colors">
                      SUBMIT
                    </button>
                  </div>
                )}
                {puzzleError && <p className="text-red-500 text-sm mt-4 font-bold text-center">{puzzleError}</p>}
                <div className="mt-8 text-center">
                  <button onClick={() => setActivePuzzle(null)} className="text-stone-500 text-xs hover:text-white transition-colors">
                    [ ABORT CONNECTION ]
                  </button>
                </div>
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
              <span className="text-xs font-bold text-yellow-500 mt-0.5">UNKNOWN AREA</span>
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