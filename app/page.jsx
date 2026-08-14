'use client';

import React, { useState } from 'react';
import DungeonEngine from '@/components/DungeonEngine';
import { FLOORS } from '@/lib/mapData';

export default function EscapeRoomPage() {
  const [currentFloor, setCurrentFloor] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');

  const triggerMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleInteract = () => {
    triggerMessage("Interacting... (Raycaster needed to pick up specific items!)");
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black font-mono">
      {!gameStarted ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-green-500">
          <h1 className="text-4xl font-bold mb-4 tracking-widest">THE OFFICE DUNGEON</h1>
          <p className="mb-6 text-zinc-400">Click to start. Use WASD to walk, Mouse to look around, 'E' to interact.</p>
          <button
            onClick={() => setGameStarted(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-black font-bold text-lg rounded shadow-lg shadow-green-900/50 transition-all"
          >
            ENTER BUILDING
          </button>
        </div>
      ) : (
        <>
          <DungeonEngine
            currentFloor={currentFloor}
            onTriggerEvent={handleInteract}
          />

          <div className="absolute top-4 left-4 z-40 bg-zinc-900/90 border border-green-500/40 p-4 rounded text-green-400 min-w-[250px]">
            <h2 className="font-bold border-b border-green-500/30 pb-1 mb-2">LOCATION</h2>
            <p className="text-sm text-zinc-200">{FLOORS[currentFloor].name}</p>
            
            <div className="mt-4 flex gap-2">
              <button onClick={() => setCurrentFloor(0)} className={`px-2 py-1 text-xs border ${currentFloor === 0 ? 'bg-green-500 text-black' : 'border-green-500'}`}>F0</button>
              <button onClick={() => setCurrentFloor(1)} className={`px-2 py-1 text-xs border ${currentFloor === 1 ? 'bg-green-500 text-black' : 'border-green-500'}`}>F1</button>
              <button onClick={() => setCurrentFloor(2)} className={`px-2 py-1 text-xs border ${currentFloor === 2 ? 'bg-green-500 text-black' : 'border-green-500'}`}>F2</button>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 border border-zinc-700 px-6 py-3 rounded-full text-zinc-300 flex items-center gap-4">
            <span className="text-xs uppercase tracking-wider text-zinc-500">Inventory:</span>
            {inventory.length === 0 ? (
              <span className="text-xs italic text-zinc-600">Empty</span>
            ) : (
              inventory.map((item, idx) => (
                <span key={idx} className="bg-zinc-800 text-green-400 px-2 py-1 text-xs rounded border border-green-500/30">
                  {item}
                </span>
              ))
            )}
          </div>

          {message && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 z-50 bg-black/80 text-yellow-400 border border-yellow-500/50 px-4 py-2 rounded text-sm animate-pulse">
              {message}
            </div>
          )}
        </>
      )}
    </main>
  );
}