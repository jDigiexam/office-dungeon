'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { FLOORS } from '@/lib/mapData';

const DungeonEngine = dynamic(() => import('@/components/DungeonEngine'), {
  ssr: false,
});

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
    triggerMessage("Interacting... (Raycaster needed to pick up items!)");
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-stone-950 font-mono select-none">
      {!gameStarted ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-stone-950 text-amber-400">
          <div className="border border-amber-500/30 p-8 rounded-lg bg-stone-900/80 shadow-2xl shadow-amber-900/20 text-center max-w-lg">
            <h1 className="text-4xl font-bold mb-2 tracking-widest text-amber-300">THE OFFICE DUNGEON</h1>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-6">Executive Suite Escape</p>
            <p className="mb-8 text-stone-400 text-sm leading-relaxed">
              Click to start. Use <span className="text-amber-300 font-bold">WASD</span> to walk, mouse to look around, and <span className="text-amber-300 font-bold">'E'</span> to interact.
            </p>
            <button
              onClick={() => setGameStarted(true)}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm tracking-wider rounded transition-all cursor-pointer shadow-md shadow-amber-900/40"
            >
              ENTER BUILDING
            </button>
          </div>
        </div>
      ) : (
        <>
          <DungeonEngine
            currentFloor={currentFloor}
            onTriggerEvent={handleInteract}
          />

          {/* Location UI Panel */}
          <div className="absolute top-4 left-4 z-40 bg-stone-900/90 border border-amber-500/40 p-4 rounded text-amber-400 min-w-[250px] shadow-lg">
            <h2 className="font-bold border-b border-amber-500/30 pb-1 mb-2 text-xs tracking-wider uppercase text-amber-300">LOCATION</h2>
            <p className="text-sm text-stone-200">{FLOORS[currentFloor].name}</p>
            
            <div className="mt-4 flex gap-2">
              {[0, 1, 2].map((f) => (
                <button
                  key={f}
                  onClick={() => setCurrentFloor(f)}
                  className={`px-3 py-1 text-xs font-bold border transition-all cursor-pointer ${
                    currentFloor === f
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'border-stone-700 text-stone-400 hover:border-amber-500/50 hover:text-amber-400'
                  }`}
                >
                  F{f}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory UI Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-stone-900/90 border border-amber-500/30 px-6 py-3 rounded-full text-stone-300 flex items-center gap-4 shadow-lg">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Inventory:</span>
            {inventory.length === 0 ? (
              <span className="text-xs italic text-stone-500">Empty</span>
            ) : (
              inventory.map((item, idx) => (
                <span key={idx} className="bg-stone-800 text-amber-300 px-3 py-1 text-xs rounded border border-amber-500/40 font-bold">
                  {item}
                </span>
              ))
            )}
          </div>

          {/* Message Popup Overlay */}
          {message && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 z-50 bg-stone-900/90 text-amber-300 border border-amber-500/50 px-5 py-2 rounded text-sm shadow-xl pointer-events-none">
              {message}
            </div>
          )}
        </>
      )}
    </main>
  );
}