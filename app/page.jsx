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
    triggerMessage("SYSTEM: Interacting with object...");
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black font-mono select-none">
      {!gameStarted ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-red-600">
          <div className="border-4 border-stone-700 bg-stone-900 p-8 text-center max-w-md shadow-[0_0_50px_rgba(220,38,38,0.3)]">
            <h1 className="text-4xl font-extrabold mb-1 tracking-widest text-red-600 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              OFFICE DUNGEON
            </h1>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-6 font-bold">1993 ESCAPE ENGINE</p>
            <p className="mb-8 text-stone-300 text-xs leading-relaxed border-y border-stone-800 py-4">
              Use <span className="text-yellow-500 font-bold">WASD</span> to run. Mouse to look around.<br />
              Press <span className="text-yellow-500 font-bold">'E'</span> to operate doors and terminals.
            </p>
            <button
              onClick={() => setGameStarted(true)}
              className="w-full py-3 bg-red-700 hover:bg-red-600 text-black font-extrabold text-base tracking-widest uppercase border-2 border-red-500 transition-all cursor-pointer shadow-lg"
            >
              START ESCAPE
            </button>
          </div>
        </div>
      ) : (
        <>
          <DungeonEngine
            currentFloor={currentFloor}
            onTriggerEvent={handleInteract}
          />

          {/* Messages Overlay */}
          {message && (
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-50 bg-stone-950 text-yellow-400 border-2 border-yellow-600 px-6 py-2 text-sm font-bold shadow-[0_0_20px_rgba(0,0,0,0.9)] pointer-events-none uppercase tracking-wider">
              {message}
            </div>
          )}

          {/* Classic DOOM Full-Width Bottom Status Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-40 bg-stone-900 border-t-4 border-stone-600 p-2 flex items-center justify-between text-stone-200 h-20 shadow-[0_-5px_25px_rgba(0,0,0,0.9)]">
            
            {/* FLOOR SELECTOR */}
            <div className="bg-stone-950 border-2 border-stone-700 px-4 py-1 flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">LEVEL</span>
              <div className="flex gap-1 mt-1">
                {[0, 1, 2].map((f) => (
                  <button
                    key={f}
                    onClick={() => setCurrentFloor(f)}
                    className={`px-2 py-0.5 text-xs font-black border transition-all cursor-pointer ${
                      currentFloor === f
                        ? 'bg-red-600 text-black border-red-400'
                        : 'bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-500'
                    }`}
                  >
                    E1M{f + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* LOCATION INDICATOR */}
            <div className="hidden md:flex bg-stone-950 border-2 border-stone-700 px-6 py-2 flex-col items-center justify-center flex-1 mx-4">
              <span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">CURRENT SECTOR</span>
              <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider mt-0.5">
                {FLOORS[currentFloor].name}
              </span>
            </div>

            {/* INVENTORY / KEYCARDS DISPLAY */}
            <div className="bg-stone-950 border-2 border-stone-700 px-4 py-1 flex flex-col items-center justify-center min-w-[180px]">
              <span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">KEYCARDS / ITEMS</span>
              <div className="flex gap-2 mt-1">
                {inventory.length === 0 ? (
                  <span className="text-xs text-stone-600 italic">NONE</span>
                ) : (
                  inventory.map((item, idx) => (
                    <span key={idx} className="bg-red-950 border border-red-600 text-red-400 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {item}
                    </span>
                  ))
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </main>
  );
}