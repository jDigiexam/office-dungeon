'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { loadMapFromImage } from '@/lib/mapParser';
import { TERMINAL_DIRECTORY, RIDDLE_BANK } from '@/lib/puzzleData';

const DungeonEngine = dynamic(() => import('@/components/DungeonEngine'), { ssr: false });

const FALLBACK_GRID = Array(10).fill(Array(10).fill(0)).map((row, z) => 
  row.map((col, x) => (x === 0 || x === 9 || z === 0 || z === 9 ? 1 : 0))
);

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

function AudioCrossfader({ currentSrc, loopCurrent, onNextTrack }) {
  const audio1 = useRef(null);
  const audio2 = useRef(null);
  const activeIdx = useRef(0);
  const faderRef = useRef(null);
  
  const playingSrc = useRef("");

  useEffect(() => {
    const a1 = audio1.current;
    const a2 = audio2.current;
    if (!a1 || !a2) return;

    if (faderRef.current) clearInterval(faderRef.current);

    if (!currentSrc) {
      playingSrc.current = "";
      [a1, a2].forEach(a => {
        if (a.paused) return;
        let v = a.volume;
        const t = setInterval(() => {
          v -= 0.1;
          if (v <= 0) { a.volume = 0; a.pause(); clearInterval(t); } 
          else { a.volume = v; }
        }, 100);
      });
      return;
    }

    if (playingSrc.current === currentSrc) {
      const activeAudio = activeIdx.current === 0 ? a1 : a2;
      activeAudio.loop = loopCurrent;
      return;
    }

    playingSrc.current = currentSrc;
    
    const oldAudio = activeIdx.current === 0 ? a1 : a2;
    activeIdx.current = activeIdx.current === 0 ? 1 : 0;
    const newAudio = activeIdx.current === 0 ? a1 : a2;

    newAudio.src = currentSrc;
    newAudio.loop = loopCurrent;
    newAudio.currentTime = 0;
    newAudio.volume = 0;
    newAudio.dataset.fadingOut = "false"; 
    
    const playPromise = newAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => console.log('Autoplay prevented by browser', err));
    }

    let fadeVol = 0;
    const MAX_BGM_VOL = 0.4; 

    faderRef.current = setInterval(() => {
      fadeVol += 0.05;
      if (fadeVol >= 1) {
        newAudio.volume = MAX_BGM_VOL;
        if (oldAudio && !oldAudio.paused) { 
          oldAudio.volume = 0; 
          oldAudio.pause(); 
        }
        clearInterval(faderRef.current);
      } else {
        newAudio.volume = Math.min(MAX_BGM_VOL, fadeVol * MAX_BGM_VOL);
        if (oldAudio && !oldAudio.paused) {
          oldAudio.volume = Math.max(0, (1 - fadeVol) * MAX_BGM_VOL);
        }
      }
    }, 100);

    return () => {
      if (faderRef.current) clearInterval(faderRef.current);
    };
  }, [currentSrc, loopCurrent]);

  const handleTimeUpdate = (e) => {
    if (loopCurrent) return;
    const audio = e.target;
    
    if (audio.duration && audio.currentTime > 5 && (audio.duration - audio.currentTime <= 2.5)) {
      if (audio.dataset.fadingOut !== "true") {
        audio.dataset.fadingOut = "true"; 
        if (onNextTrack) onNextTrack();
      }
    }
  };

  const handleEnded = (e) => {
    if (loopCurrent) return;
    const audio = e.target;
    if (audio.dataset.fadingOut !== "true") {
      audio.dataset.fadingOut = "true";
      if (onNextTrack) onNextTrack();
    }
  };

  return (
    <>
      <audio ref={audio1} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} />
      <audio ref={audio2} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} />
    </>
  );
}

function FakePresentation({ onGlitchComplete }) {
  const [slide, setSlide] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  
  // Create a ref to hold the audio object so we can stop it later
  const glitchAudioRef = useRef(null);

  // URL-encode spaces (%20) so the browser correctly fetches from the public folder
  const slideImages = [
    "/Murder%20Mystery%201.jpg",
    "/Murder%20Mystery%202.jpg",
    "/Murder%20Mystery%203.jpg",
    "/Murder%20Mystery%204.jpg"
  ];

  // Cleanup function to ensure audio stops if the component unmounts
  useEffect(() => {
    return () => {
      if (glitchAudioRef.current) {
        glitchAudioRef.current.pause();
        glitchAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleNext = () => {
    if (slide < slideImages.length - 1) {
      setSlide(slide + 1);
    } else {
      setIsGlitching(true);
      
      // Store the audio in the ref and play it
      glitchAudioRef.current = new Audio('/boss_roar.mp3'); 
      glitchAudioRef.current.volume = 1.0;
      glitchAudioRef.current.play().catch(() => {});

      setTimeout(() => {
        // Cut the audio completely before dropping into the game
        if (glitchAudioRef.current) {
          glitchAudioRef.current.pause();
          glitchAudioRef.current.currentTime = 0;
        }
        onGlitchComplete();
      }, 2500); 
    }
  };

  return (
    <div className={`absolute inset-0 z-[100] flex flex-col bg-[#111111] text-stone-200 font-sans transition-all select-none ${isGlitching ? 'glitch-static bg-stone-900' : ''}`}>
      
      {/* Main Slide Area - 16:9 Aspect Ratio Container */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div 
          className="relative w-full max-w-6xl aspect-video bg-black shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-stone-800 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          onClick={!isGlitching ? handleNext : undefined}
        >
          <img 
            src={slideImages[slide]} 
            alt={`Slide ${slide + 1}`} 
            className={`w-full h-full object-cover transition-opacity duration-300 ${isGlitching ? 'opacity-20' : 'opacity-100'}`}
          />
          
          {isGlitching && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <h1 className="text-4xl md:text-6xl font-black text-stone-300 tracking-[0.2em] font-mono text-center leading-relaxed">
                SIGNAL LOST<br/>
                <span className="text-xl md:text-2xl text-stone-500 animate-pulse">RE-ROUTING TO LOCAL TERMINAL...</span>
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Fake Presentation Toolbar */}
      {!isGlitching && (
        <div className="h-14 bg-[#141414] flex items-center justify-between px-6 border-t border-stone-900 text-stone-500">
          <div className="flex items-center gap-4">
            <span className="text-xs tracking-widest uppercase">Slide {slide + 1}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={(e) => { e.stopPropagation(); setSlide(Math.max(0, slide - 1)); }} 
              className={`transition-colors ${slide === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-stone-300 cursor-pointer'}`}
              disabled={slide === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }} 
              className={`transition-colors ${slide === slideImages.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-stone-300 cursor-pointer'}`}
              disabled={slide === slideImages.length - 1}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
            <div className="w-px h-5 bg-stone-800 mx-2"></div>
            <div className="flex gap-4">
              <svg className="w-4 h-4 hover:text-stone-300 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
              <svg className="w-4 h-4 hover:text-stone-300 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            </div>
          </div>
          
          <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-stone-600">DigiExam 2026</div>
        </div>
      )}
    </div>
  );
}

export default function EscapeRoomPage() {
  const [showBait, setShowBait] = useState(true);
  
  const [gameWon, setGameWon] = useState(false); 
  const [currentFloor, setCurrentFloor] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [teleportCoords, setTeleportCoords] = useState(null);
  
  const [deathCount, setDeathCount] = useState(0);
  const [playTime, setPlayTime] = useState(0);

  const [grids, setGrids] = useState(null);
  const [spawnCoords, setSpawnCoords] = useState([5.5, 0.8, 5.5]);
  const [floorSpawns, setFloorSpawns] = useState([]); 
  const [mapsLoading, setMapsLoading] = useState(true);

  const [activePuzzle, setActivePuzzle] = useState(null);
  const [solvedPuzzles, setSolvedPuzzles] = useState([]);
  const [puzzleInput, setPuzzleInput] = useState('');
  const [puzzleError, setPuzzleError] = useState('');

  const [assignedRiddles, setAssignedRiddles] = useState({}); 
  const [usedRiddleIndices, setUsedRiddleIndices] = useState([]);
  
  const [puzzleGrid, setPuzzleGrid] = useState([]);
  
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [isPlayingMemory, setIsPlayingMemory] = useState(false);
  const [flashNode, setFlashNode] = useState(null);

  const [mastermindCode, setMastermindCode] = useState('');
  const [mastermindGuesses, setMastermindGuesses] = useState([]);
  const [mastermindInput, setMastermindInput] = useState('');

  const [playerGridPos, setPlayerGridPos] = useState({ x: 5, z: 5 });
  const [exploredTiles, setExploredTiles] = useState(new Set());

  const [hp, setHp] = useState(100);
  const [isDead, setIsDead] = useState(false);
  const [screenFlash, setScreenFlash] = useState('');
  const [isFading, setIsFading] = useState(false); 

  const [signalValues, setSignalValues] = useState({ freq: 1, amp: 1, phase: 0 });

  const [systemBooted, setSystemBooted] = useState(false); 

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  
  const gameplayPlaylist = [
    '/17 Triage at Dawn.mp3', 
    '/05 Dark Energy.mp3',
    '/06 Requiem for Ravenholm.mp3',
    '/07 Pulse Phase.mp3',
    '/08 Ravenholm Reprise.mp3',
    '/12 Apprehension and Evasion.mp3',
    '/14 Our Resurrected Teleport.mp3'
  ];

  const playSFX = (id, vol = 1.0) => {
    const el = document.getElementById(id);
    if (el) {
      el.volume = vol;
      el.currentTime = 0;
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => console.warn(`SFX ${id} blocked:`, e));
      }
    }
  };

  useEffect(() => {
    const storedDeaths = parseInt(sessionStorage.getItem('zeroDay_deaths') || '0', 10);
    const storedTime = parseInt(sessionStorage.getItem('zeroDay_time') || '0', 10);
    setDeathCount(storedDeaths);
    setPlayTime(storedTime);
  }, []);

  useEffect(() => {
    let interval;
    if (gameStarted && !isDead && !gameWon) {
      interval = setInterval(() => {
        setPlayTime((prev) => {
          const nextTime = prev + 1;
          sessionStorage.setItem('zeroDay_time', nextTime.toString());
          return nextTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isDead, gameWon]);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const floor0 = await loadMapFromImage('/map_floor_0.png').catch(() => ({ grid: FALLBACK_GRID, spawnPoint: null }));
        const floor1 = await loadMapFromImage('/map_floor_1.png').catch(() => ({ grid: FALLBACK_GRID, spawnPoint: null }));
        const floor2 = await loadMapFromImage('/map_floor_2.png').catch(() => ({ grid: FALLBACK_GRID, spawnPoint: null }));

        setGrids([floor0.grid, floor1.grid, floor2.grid]);
        
        setFloorSpawns([floor0.spawnPoint, floor1.spawnPoint, floor2.spawnPoint]);
        
        if (floor0.spawnPoint) setSpawnCoords(floor0.spawnPoint);
        setMapsLoading(false);
      } catch (err) {
        console.error("Failed to load map images", err);
        setGrids([FALLBACK_GRID, FALLBACK_GRID, FALLBACK_GRID]);
        setFloorSpawns([null, null, null]); 
        setMapsLoading(false);
      }
    };
    fetchMaps();
  }, []);

  const triggerMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePlayerMove = (x, z) => {
    if (x === playerGridPos.x && z === playerGridPos.z) return;

    setPlayerGridPos({ x, z });
    setExploredTiles(prev => {
      const next = new Set(prev);
      for(let dx = -1; dx <= 1; dx++) {
        for(let dz = -1; dz <= 1; dz++) {
          next.add(`${x + dx}_${z + dz}`);
        }
      }
      return next;
    });
  };

  const handleEnemyEradicated = (isBoss) => {
    if (isBoss === true) {
      setIsFading(true);
      setTimeout(() => {
        setGameWon(true);
        setIsFading(false);
      }, 2000);
    } else {
      triggerMessage("SHADOW ENTITY ERADICATED.");
    }
  };

  const handlePlayerHit = () => {
    setHp((prevHp) => {
      const newHp = Math.max(0, prevHp - 20); 
      if (newHp === 0) {
        setScreenFlash('bg-red-900/90');
        setTimeout(() => {
          setIsDead(true);
          setDeathCount((prev) => {
            const newCount = prev + 1;
            sessionStorage.setItem('zeroDay_deaths', newCount.toString());
            return newCount;
          });
        }, 800);
      } else {
        triggerMessage("CRITICAL WARNING: ENTITY CONTACT.");
        setScreenFlash('bg-red-600/60');
        setTimeout(() => setScreenFlash(''), 300);
      }
      return newHp;
    });
  };

  const handlePuzzleSuccess = (puzzle) => {
    const { reward } = puzzle;
    const newGrids = [...grids];
    newGrids[reward.fIdx] = grids[reward.fIdx].map((row, rIdx) =>
      row.map((col, cIdx) => (rIdx === reward.z && cIdx === reward.x ? reward.newTile : col))
    );
    setGrids(newGrids);
    setSolvedPuzzles([...solvedPuzzles, puzzle.key]);
    triggerMessage(puzzle.successMessage);
    setActivePuzzle(null);

    if ([8, 18, 28, 17, 38].includes(reward.newTile)) {
      playSFX('sfx-door', 1.0);
    }
  };

  const handlePuzzleSubmit = (submittedAnswer) => {
    const isCorrect = submittedAnswer.toString().toLowerCase().trim() === activePuzzle.answer.toString().toLowerCase().trim();
    if (isCorrect) {
      handlePuzzleSuccess(activePuzzle);
    } else {
      setPuzzleError('INCORRECT CREDENTIALS OR ANSWER.');
    }
  };

  const handleNodeClick = (index) => {
    const size = activePuzzle.gridSize;
    const newGrid = [...puzzleGrid];
    const r = Math.floor(index / size);
    const c = index % size;

    const toggle = (row, col) => {
      if (row >= 0 && row < size && col >= 0 && col < size) {
        const idx = row * size + col;
        newGrid[idx] = newGrid[idx] === 1 ? 0 : 1;
      }
    };

    toggle(r, c);       
    toggle(r - 1, c);   
    toggle(r + 1, c);   
    toggle(r, c - 1);   
    toggle(r, c + 1);   

    setPuzzleGrid(newGrid);

    if (newGrid.every(cell => cell === 1)) {
      setTimeout(() => handlePuzzleSuccess(activePuzzle), 300);
    }
  };

  const handleSlideClick = (index) => {
    const size = activePuzzle.gridSize;
    const newGrid = [...puzzleGrid];
    const emptyIdx = newGrid.indexOf(0);
    
    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIdx / size);
    const emptyCol = emptyIdx % size;
    
    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
    
    if (isAdjacent) {
      newGrid[emptyIdx] = newGrid[index];
      newGrid[index] = 0;
      setPuzzleGrid(newGrid);
      
      const winState = Array.from({length: size * size - 1}, (_, i) => i + 1).concat(0).join(',');
      
      if (newGrid.join(',') === winState) {
        setTimeout(() => handlePuzzleSuccess(activePuzzle), 300);
      }
    }
  };

  const playMemorySequence = async (seq) => {
    setIsPlayingMemory(true);
    setPuzzleError('');
    await new Promise(r => setTimeout(r, 800)); 
    
    for (let i = 0; i < seq.length; i++) {
      setFlashNode(seq[i]);
      await new Promise(r => setTimeout(r, 500)); 
      setFlashNode(null);
      await new Promise(r => setTimeout(r, 250)); 
    }
    setIsPlayingMemory(false);
  };

  const handleMemoryClick = (node) => {
    if (isPlayingMemory) return;
    
    const seq = activePuzzle.sequence;
    if (node === seq[memoryIndex]) {
      const nextIdx = memoryIndex + 1;
      setMemoryIndex(nextIdx);
      
      setFlashNode(node);
      setTimeout(() => setFlashNode(null), 200);

      if (nextIdx === seq.length) {
        setTimeout(() => handlePuzzleSuccess(activePuzzle), 400);
      }
    } else {
      setPuzzleError('SEQUENCE FAILED. REBOOTING...');
      setMemoryIndex(0);
      setIsPlayingMemory(true); 
      
      setTimeout(() => {
        playMemorySequence(seq);
      }, 1500);
    }
  };

  const handleMastermindSubmit = () => {
    if (mastermindInput.length !== 4 || isNaN(mastermindInput)) {
      setPuzzleError('ENTER A VALID 4-DIGIT NUMBER.');
      return;
    }

    let bulls = 0;
    let cows = 0;
    const targetArr = mastermindCode.split('');
    const guessArr = mastermindInput.split('');

    for (let i = 0; i < 4; i++) {
      if (guessArr[i] === targetArr[i]) {
        bulls++;
        targetArr[i] = null; 
        guessArr[i] = null;
      }
    }

    for (let i = 0; i < 4; i++) {
      if (guessArr[i] !== null) {
        const matchIdx = targetArr.indexOf(guessArr[i]);
        if (matchIdx > -1) {
          cows++;
          targetArr[matchIdx] = null;
        }
      }
    }

    const newGuesses = [...mastermindGuesses, { guess: mastermindInput, bulls, cows }];
    setMastermindGuesses(newGuesses);
    setMastermindInput('');
    setPuzzleError('');

    if (bulls === 4) {
      setTimeout(() => handlePuzzleSuccess(activePuzzle), 500);
    } else if (newGuesses.length >= 8) { 
      setPuzzleError(`LOCKOUT. THE CODE WAS: ${mastermindCode}`);
      setTimeout(() => {
        let newCode = '';
        for(let i=0; i<4; i++) newCode += Math.floor(Math.random() * 10).toString();
        setMastermindCode(newCode);
        setMastermindGuesses([]);
        setPuzzleError('');
      }, 3000);
    }
  };

  const handleInteract = (tileType, x, z, fIdx) => {
    const openDoor = (targetType) => {
      playSFX('sfx-door', 1.0);

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

    if (tileType === 7) { triggerMessage("LOCKED - TERMINAL OVERRIDE REQUIRED"); }
    if (tileType === 32) { triggerMessage("DOOR OPENED"); openDoor(38); }

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

      const terminalData = TERMINAL_DIRECTORY[puzzleKey];
      if (terminalData) {
        document.exitPointerLock();
        let puzzleDataToUse = terminalData;

        if (terminalData.type === 'random-riddle') {
          if (assignedRiddles[puzzleKey]) {
            puzzleDataToUse = { ...terminalData, ...assignedRiddles[puzzleKey] };
          } else {
            const availableRiddles = RIDDLE_BANK.filter((_, idx) => !usedRiddleIndices.includes(idx));
            if (availableRiddles.length === 0) { triggerMessage("NO MORE DATA."); return; }
            
            const chosenIndex = RIDDLE_BANK.indexOf(availableRiddles[Math.floor(Math.random() * availableRiddles.length)]);
            
            setUsedRiddleIndices([...usedRiddleIndices, chosenIndex]);
            setAssignedRiddles({ ...assignedRiddles, [puzzleKey]: RIDDLE_BANK[chosenIndex] });
            
            puzzleDataToUse = { ...terminalData, ...RIDDLE_BANK[chosenIndex], type: "text-input" };
          }
        }

        if (terminalData.type === 'lights-out' || terminalData.type === 'sliding-puzzle') {
          setPuzzleGrid([...terminalData.initialGrid]);
        }
        
        if (terminalData.type === 'memory-match') {
          setMemoryIndex(0);
          playMemorySequence(terminalData.sequence);
        }

        if (terminalData.type === 'mastermind') {
          let newCode = '';
          for(let i=0; i<4; i++) newCode += Math.floor(Math.random() * 10).toString();
          setMastermindCode(newCode);
          setMastermindGuesses([]);
          setMastermindInput('');
        }

        if (terminalData.type === 'signal-sync') {
          setSignalValues({ freq: 1, amp: 1, phase: 0 });
        }

        setActivePuzzle({ ...puzzleDataToUse, key: puzzleKey });
        setPuzzleInput(''); setPuzzleError('');
      } else {
        triggerMessage(`OFFLINE. ADD KEY "${puzzleKey}" TO DIRECTORY.`);
      }
    }

    if (tileType === 3) { triggerMessage("ELEVATOR DOORS OPENING"); openDoor(10); }
  };

  const handleEnterElevator = (fIdx) => {
    if (fIdx === 1) {
      setIsFading(true);
      setTimeout(() => {
        setGameWon(true);
        setIsFading(false);
      }, 2000);
      return;
    }

    const targetFloor = fIdx + 1;
    if (targetFloor >= grids.length || !grids[targetFloor]) {
      triggerMessage("MAXIMUM FLOOR REACHED");
      return;
    }
    
    setIsFading(true);

    setTimeout(() => {
      let safeTransit;

      if (floorSpawns[targetFloor]) {
        safeTransit = {
          x: floorSpawns[targetFloor][0],
          y: targetFloor * 3.2 + 0.8,
          z: floorSpawns[targetFloor][2]
        };
      } else {
        let foundX = 5.5, foundZ = 5.5;
        for (let z = 2; z < grids[targetFloor].length - 2; z++) {
          for (let x = 2; x < grids[targetFloor][z].length - 2; x++) {
            if (grids[targetFloor][z][x] === 0) {
              foundX = x + 0.5;
              foundZ = z + 0.5;
              break;
            }
          }
        }
        safeTransit = { x: foundX, y: targetFloor * 3.2 + 0.8, z: foundZ };
      }

      setTeleportCoords(safeTransit);
      setCurrentFloor(targetFloor); 
      setSpawnCoords([safeTransit.x, safeTransit.y, safeTransit.z]); 
      
      triggerMessage(`ELEVATOR TRANSIT: FLOOR E1M${targetFloor + 1}`);
      
      const newGrids = [...grids];
      newGrids[fIdx] = grids[fIdx].map(row => row.map(cell => cell === 10 ? 3 : cell));
      setGrids(newGrids);

      setTimeout(() => setIsFading(false), 500);

    }, 2000);
  };

  const handleRespawn = () => {
    let safeTransit;

    if (floorSpawns[currentFloor]) {
      safeTransit = {
        x: floorSpawns[currentFloor][0],
        y: currentFloor * 3.2 + 0.8,
        z: floorSpawns[currentFloor][2]
      };
    } else {
      let foundX = 5.5, foundZ = 5.5;
      for (let z = 2; z < grids[currentFloor].length - 2; z++) {
        for (let x = 2; x < grids[currentFloor][z].length - 2; x++) {
          if (grids[currentFloor][z][x] === 0) {
            foundX = x + 0.5;
            foundZ = z + 0.5;
            break;
          }
        }
      }
      safeTransit = { x: foundX, y: currentFloor * 3.2 + 0.8, z: foundZ };
    }

    setSpawnCoords([safeTransit.x, safeTransit.y, safeTransit.z]);
    setTeleportCoords(safeTransit);
    setHp(100);
    setIsDead(false);
    setScreenFlash('');
  };

  let activeAudioSrc = "";
  let loopAudio = false;

  if (showBait || !systemBooted) {
    activeAudioSrc = ""; 
  } else if (gameWon) {
    activeAudioSrc = "/In the House, In a Heartbeat.mp3"; 
    loopAudio = true;
  } else if (!gameStarted) {
    activeAudioSrc = "/In the House, In a Heartbeat.mp3";
    loopAudio = true;
  } else if (isDead) {
    activeAudioSrc = "/08 Ravenholm Reprise.mp3"; 
  } else if (currentFloor === 1) { 
    activeAudioSrc = "/43 Lambda Core.mp3";
    loopAudio = true;
  } else {
    activeAudioSrc = gameplayPlaylist[currentTrackIndex];
    loopAudio = false; 
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black font-mono select-none">
      
      {showBait && (
        <FakePresentation onGlitchComplete={() => setShowBait(false)} />
      )}

      <audio id="sfx-door" src="/door.mp3" preload="auto" />
      <audio id="sfx-imp" src="/imp_sight.mp3" preload="auto" />
      <audio id="sfx-boss" src="/boss_roar.mp3" preload="auto" />

      <AudioCrossfader 
        currentSrc={activeAudioSrc} 
        loopCurrent={loopAudio} 
        onNextTrack={() => setCurrentTrackIndex((prev) => (prev + 1) % gameplayPlaylist.length)} 
      />

      {!systemBooted ? (
        <div 
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black cursor-pointer hover:bg-stone-900 transition-colors duration-500" 
          onClick={() => setSystemBooted(true)}
        >
          <div className="text-red-600 animate-pulse font-bold tracking-widest text-xl border-2 border-red-900 p-8 shadow-[0_0_30px_rgba(153,27,27,0.5)]">
            CLICK TO INITIALIZE TERMINAL...
          </div>
        </div>
      ) : !gameStarted ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-red-600">
          
          <style>{`
            @keyframes cinematic-scroll {
              0% { transform: translateY(260px); }
              100% { transform: translateY(-100%); }
            }
            .animate-scroll-text {
              animation: cinematic-scroll 45s linear forwards;
            }
          `}</style>

          <div className="border-4 border-stone-800 bg-stone-900 p-8 flex flex-col items-center justify-center w-full max-w-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            <h1 className="text-6xl font-black mb-4 tracking-widest text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
              ZERO-DAY
            </h1>
            
            <div 
              className="relative w-full h-64 my-6 bg-black border-y-2 border-stone-800 overflow-hidden"
              style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
            >
              <div className="absolute w-full animate-scroll-text flex flex-col gap-8 text-center px-12">
                <p className="text-red-500 font-bold tracking-widest leading-loose">
                  2026.11.02<br/>
                  SECTOR 4 OF THE MEGACORP BIOENGINEERING COMPLEX<br/>
                  WENT DARK EXACTLY 72 HOURS AGO.
                </p>
                <p className="text-stone-300 font-bold tracking-widest leading-loose">
                  NO EVACUATION ORDER WAS ISSUED.<br/>
                  NO SURVIVORS HAVE EMERGED.<br/>
                  SOMETHING WENT WRONG.<br/>
                </p>
                <p className="text-stone-300 font-bold tracking-widest leading-loose">
                  YOU AWAKE NEAR A LAB BENCH.<br/>
                  GLOWING LIQUID IS SPILLED ON YOUR COAT.<br/>
                  YOU HAVE THE FAINT MEMORY THAT YOU WERE ONCE<br/>
                  A RESEARCH SCIENTIST.
                </p>
                <p className="text-stone-300 font-bold tracking-widest leading-loose">
                  YOUR RIGHT HAND BURNS FROM THE CHEMICALS.<br/>
                  YOUR MIND RACES AND YOU THINK YOU SEE MOVING SHADOWS.<br/>
                  YOUR MISSION: FIND OUT WHAT HAPPENED AND ESCAPE...
                </p>
                <p className="text-stone-300 font-bold tracking-widest leading-loose">
                  BUT THE SECURITY GRID IS LOCKED.<br/>
                  AND THE THERMAL SCANS INDICATE YOU ARE NOT ALONE...
                </p>
                <p className="text-red-600 font-black tracking-[0.3em] text-xl mt-4">
                  SURVIVE. ESCAPE.
                </p>
              </div>
            </div>

            <p className="mb-8 text-stone-400 text-xs tracking-[0.2em] uppercase font-bold text-center">
              Controls: WASD to Move | Mouse to Look | Left Click/Space to Fire | 'E' to Interact
            </p>
            
            {mapsLoading ? (
              <button disabled className="w-full py-4 bg-stone-800 text-stone-500 font-extrabold tracking-widest animate-pulse border-2 border-stone-700">
                INITIALIZING...
              </button>
            ) : (
              <button onClick={() => setGameStarted(true)} className="w-full py-4 bg-red-800 hover:bg-red-600 text-black font-black text-xl tracking-[0.3em] transition-colors border-2 border-red-900 shadow-[0_0_15px_rgba(153,27,27,0.8)]">
                BEGIN THE ESCAPE.
              </button> 
            )} 
          </div>
        </div>
        ) : gameWon ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-emerald-500">
            <style>{`
              @keyframes cinematic-scroll-win {
                0% { transform: translateY(100%); }
                100% { transform: translateY(-100%); }
              }
              .animate-scroll-text-win {
                animation: cinematic-scroll-win 40s linear forwards;
              }
            `}</style>
            
            <div className="border-4 border-emerald-900 bg-stone-950 flex flex-col items-center justify-center w-full max-w-3xl shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden h-[600px]">
              
              <div 
                className="absolute inset-0 z-10 pointer-events-none"
                style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' }}
              >
                <div className="absolute w-full animate-scroll-text-win flex flex-col gap-10 text-center px-16 h-full mt-32">
                  <h1 className="text-5xl font-black mb-8 tracking-[0.3em] text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
                    SYSTEM BREACHED.
                  </h1>
                  
                  <p className="text-emerald-400 font-bold tracking-widest leading-loose">
                    YOU DEFEATED THE OMEGA ANOMALY.
                  </p>
                  <p className="text-stone-300 font-bold tracking-widest leading-loose">
                    THE FINAL CONTAINMENT DOORS OPENED, ALLOWING YOU TO ASCEND TO THE SURFACE.
                  </p>
                  <p className="text-stone-300 font-bold tracking-widest leading-loose">
                    BUT AS THE ELEVATOR DOORS PART, YOU ARE NOT GREETED BY RESCUE TEAMS.
                  </p>
                  <p className="text-stone-300 font-bold tracking-widest leading-loose">
                    THE SKY IS BURNING. THE CITY IS IN RUINS.
                  </p>
                  <p className="text-stone-300 font-bold tracking-widest leading-loose">
                    THE BIOENGINEERING COMPLEX WAS JUST THE FIRST TO FALL.
                  </p>
                  <p className="text-stone-300 font-bold tracking-widest leading-loose">
                    FIGURES LOOM OMINOUSLY IN THE SHADOWS. THE SMELL OF DEATH IN THE AIR.
                  </p>
                  <p className="text-emerald-500 font-black tracking-[0.3em] text-2xl mt-12">
                    ARE YOU ALL THAT IS LEFT OF HUMANITY?
                  </p>

                  <p className="text-emerald-400 font-bold tracking-[0.2em] text-sm mt-2">
                    TOTAL TIME: {formatTime(playTime)} | SYSTEM REBOOTS: {deathCount}
                  </p>

                  <p className="text-red-600 font-black tracking-[0.3em] text-3xl mt-4 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">
                    THE TRUE NIGHTMARE BEGINS.
                  </p>
                </div>
              </div>
  
              <div className="absolute bottom-6 z-20">
                <button 
                  onClick={() => {
                    sessionStorage.removeItem('zeroDay_time');
                    sessionStorage.removeItem('zeroDay_deaths');
                    window.location.reload();
                  }}
                  className="py-3 px-8 bg-stone-900 hover:bg-emerald-800 text-emerald-500 hover:text-black font-black text-sm tracking-[0.3em] transition-colors border border-emerald-900"
                >
                  INITIALIZE REBOOT
                </button>
              </div>
            </div>
          </div>
        ) : isDead ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950 text-red-500 pointer-events-auto">
          <div className="border-4 border-red-900 bg-black p-12 text-center max-w-lg shadow-[0_0_50px_rgba(153,27,27,0.5)]">
            <h1 className="text-6xl font-black mb-4 tracking-widest text-red-600">YOU DIED</h1>
            <p className="mb-2 text-red-400 text-sm tracking-widest">VITAL SIGNS LOST. ENTITY OVERRUN.</p>
            
            <p className="mb-12 text-red-800 font-bold text-xs tracking-widest">TIME ACTIVE: {formatTime(playTime)} | TOTAL DEATHS: {deathCount}</p>
            
            <button 
              onClick={handleRespawn} 
              className="w-full py-4 bg-red-800 hover:bg-red-600 text-black font-extrabold text-xl transition-colors uppercase tracking-widest"
            >
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      ) : (
        <>
          <div id="engine-wrapper" className={`absolute inset-0 ${activePuzzle ? 'pointer-events-none' : 'pointer-events-auto'}`}>
            <DungeonEngine
              grids={grids}
              initialSpawn={spawnCoords}
              onInteract={handleInteract}
              teleportCoords={teleportCoords}
              clearTeleport={() => setTeleportCoords(null)}
              onFloorChange={(f) => setCurrentFloor(f)}
              onEnterElevator={handleEnterElevator}
              onPlayerMove={handlePlayerMove} 
              onEradicate={handleEnemyEradicated}
              onPlayerHit={handlePlayerHit}
              isPuzzleActive={!!activePuzzle} 
              currentFloor={currentFloor}
              playSFX={playSFX} 
            />
          </div>

        <div className={`absolute inset-0 z-40 pointer-events-none transition-colors duration-100 ${screenFlash}`} />
        <div className={`absolute inset-0 z-40 pointer-events-none transition-opacity duration-[2000ms] bg-black ${isFading ? 'opacity-100' : 'opacity-0'}`} />

          <div className="absolute top-4 right-4 z-40 bg-stone-900/90 border-2 border-stone-600 p-2 pointer-events-none shadow-2xl backdrop-blur-sm">
            <div className="text-[10px] text-emerald-500 font-black mb-2 text-center tracking-widest">SECTOR SCANNER</div>
            <div 
              className="grid gap-[1px] bg-black border border-stone-800 p-0.5"
              style={{ gridTemplateColumns: `repeat(15, minmax(0, 1fr))` }}
            >
              {Array.from({ length: 15 * 15 }).map((_, idx) => {
                const radarX = playerGridPos.x - 7 + (idx % 15);
                const radarZ = playerGridPos.z - 7 + Math.floor(idx / 15);
                const tileKey = `${radarX}_${radarZ}`;
                
                let tileClass = "w-3 h-3 bg-black"; 
                
                if (exploredTiles.has(tileKey) && grids?.[currentFloor]?.[radarZ]?.[radarX] !== undefined) {
                  const type = grids[currentFloor][radarZ][radarX];
                  
                  if (radarX === playerGridPos.x && radarZ === playerGridPos.z) {
                    tileClass = "w-3 h-3 bg-red-500 animate-pulse rounded-full shadow-[0_0_8px_rgba(239,68,68,1)]"; 
                  } else if (type === 1) tileClass = "w-3 h-3 bg-stone-700"; 
                  else if (type === 0) tileClass = "w-3 h-3 bg-stone-900"; 
                  else if (type === 4) tileClass = "w-3 h-3 bg-emerald-500"; 
                  else if ([2,5,12,15,22,25].includes(type)) tileClass = "w-3 h-3 bg-yellow-500"; 
                  else if ([7,32,38,17].includes(type)) tileClass = "w-3 h-3 bg-stone-500"; 
                  else if (type === 3 || type === 10) tileClass = "w-3 h-3 bg-cyan-500"; 
                  else if (type === 9) tileClass = "w-3 h-3 bg-purple-500 animate-pulse";
                  else tileClass = "w-3 h-3 bg-stone-900"; 
                }
                
                return <div key={idx} className={tileClass} />;
              })}
            </div>
          </div>

          {activePuzzle && (
            <div 
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto"
              onPointerDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              onMouseDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
            >
              <div className="bg-stone-900 border-4 border-emerald-600 p-8 w-[600px] max-w-[90vw] shadow-2xl shadow-emerald-900/20">
                <div className="flex justify-between items-center mb-6 border-b-2 border-stone-700 pb-4">
                  <h2 className="text-emerald-500 text-xl font-black tracking-widest">{activePuzzle.title}</h2>
                  <span className="text-stone-500 text-xs animate-pulse">AWAITING INPUT...</span>
                </div>
                <p className="text-stone-200 text-lg mb-8 leading-relaxed">{activePuzzle.question}</p>
                
                {activePuzzle.type === 'mastermind' ? (
                  <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
                    <div className="bg-stone-950 border-2 border-stone-700 p-4 min-h-[240px] flex flex-col gap-2">
                      {mastermindGuesses.map((g, i) => (
                        <div key={i} className="flex justify-between items-center text-lg font-black text-stone-300 bg-stone-900 px-4 py-2 border border-stone-700">
                          <span className="tracking-[0.5em]">{g.guess}</span>
                          <div className="flex gap-1">
                            {Array.from({ length: g.bulls }).map((_, j) => <div key={`b-${j}`} className="w-3 h-3 bg-emerald-500 rounded-full" />)}
                            {Array.from({ length: g.cows }).map((_, j) => <div key={`c-${j}`} className="w-3 h-3 bg-yellow-500 rounded-full" />)}
                          </div>
                        </div>
                      ))}
                      {mastermindGuesses.length === 0 && <p className="text-stone-600 text-sm text-center mt-8">NO ATTEMPTS LOGGED</p>}
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        maxLength="4"
                        value={mastermindInput}
                        onChange={(e) => { setMastermindInput(e.target.value.replace(/\D/g, '')); setPuzzleError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleMastermindSubmit()}
                        disabled={mastermindGuesses.length >= 8} 
                        className="flex-1 bg-black border-2 border-stone-600 text-emerald-400 p-3 font-mono text-xl focus:border-emerald-500 outline-none tracking-widest text-center"
                        placeholder="0000"
                        autoFocus
                      />
                      <button 
                        onClick={handleMastermindSubmit} 
                        disabled={mastermindGuesses.length >= 8} 
                        className="bg-emerald-700 hover:bg-emerald-500 text-black px-6 font-extrabold uppercase tracking-widest transition-colors"
                      >
                        RUN
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 text-right">
                      ATTEMPTS REMAINING: {8 - mastermindGuesses.length} 
                    </p>
                  </div>
                ) : activePuzzle.type === 'memory-match' ? (
                  <div className="grid grid-cols-2 gap-4 mx-auto w-64">
                    {[0, 1, 2, 3].map((node) => {
                      const colors = ['bg-red-700', 'bg-blue-700', 'bg-emerald-700', 'bg-yellow-600'];
                      const activeColors = [
                        'bg-red-400 shadow-[0_0_25px_rgba(248,113,113,1)] scale-105', 
                        'bg-blue-400 shadow-[0_0_25px_rgba(96,165,250,1)] scale-105', 
                        'bg-emerald-400 shadow-[0_0_25px_rgba(52,211,153,1)] scale-105', 
                        'bg-yellow-300 shadow-[0_0_25px_rgba(253,224,71,1)] scale-105'
                      ];
                      
                      return (
                        <button 
                          key={node} 
                          onClick={() => handleMemoryClick(node)} 
                          disabled={isPlayingMemory}
                          className={`h-28 w-28 border-4 border-stone-800 transition-all duration-100 ${
                            flashNode === node ? activeColors[node] : colors[node] + ' opacity-40'
                          } ${!isPlayingMemory ? 'hover:opacity-80' : ''}`}
                        />
                      );
                    })}
                  </div>
                ) : activePuzzle.type === 'sliding-puzzle' ? (
                  <div 
                    className="grid gap-2 mx-auto" 
                    style={{ 
                      gridTemplateColumns: `repeat(${activePuzzle.gridSize}, minmax(0, 1fr))`,
                      width: `${activePuzzle.gridSize * 80}px` 
                    }}
                  >
                    {puzzleGrid.map((tile, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => tile !== 0 && handleSlideClick(idx)} 
                        className={`h-20 w-20 border-4 transition-all flex items-center justify-center text-2xl font-black ${
                          tile === 0 
                            ? 'bg-transparent border-transparent cursor-default' 
                            : 'bg-stone-900 border-stone-600 hover:border-emerald-500 text-emerald-400 hover:text-emerald-300'
                        }`}
                      >
                        {tile !== 0 ? tile : ''}
                      </button>
                    ))}
                  </div>
                ) : activePuzzle.type === 'lights-out' ? (
                  <div 
                    className="grid gap-2 mx-auto" 
                    style={{ 
                      gridTemplateColumns: `repeat(${activePuzzle.gridSize}, minmax(0, 1fr))`,
                      width: `${activePuzzle.gridSize * 80}px` 
                    }}
                  >
                    {puzzleGrid.map((nodeState, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleNodeClick(idx)} 
                        className={`h-20 w-20 border-4 transition-colors ${
                          nodeState === 1 
                            ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.8)]' 
                            : 'bg-stone-900 border-stone-700 hover:border-emerald-900'
                        }`}
                      />
                    ))}
                  </div>

) : activePuzzle.type === 'signal-sync' ? (
  <div className="flex flex-col gap-6 w-full mx-auto">
    
    <div className="bg-stone-950 border-2 border-stone-700 w-full h-40 relative overflow-hidden flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      <svg viewBox="0 0 300 150" className="w-full h-full absolute inset-0 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">
        <path 
          d={`M ${Array.from({length: 61}).map((_, i) => `${i * 5},${75 + Math.sin((i * 5 * 0.02 * activePuzzle.target.freq) + (activePuzzle.target.phase * 0.5)) * (activePuzzle.target.amp * 12)}`).join(' L ')}`} 
          fill="none" stroke="#991b1b" strokeWidth="3" opacity="0.5" strokeDasharray="4 4" 
        />
        <path 
          d={`M ${Array.from({length: 61}).map((_, i) => `${i * 5},${75 + Math.sin((i * 5 * 0.02 * signalValues.freq) + (signalValues.phase * 0.5)) * (signalValues.amp * 12)}`).join(' L ')}`} 
          fill="none" stroke="#10b981" strokeWidth="3" 
        />
      </svg>
    </div>

    <div className="flex flex-col gap-4 bg-stone-950 border border-stone-800 p-4">
      {[
        { label: 'FREQUENCY (Hz)', key: 'freq', min: 1, max: 5 },
        { label: 'AMPLITUDE (mV)', key: 'amp', min: 1, max: 5 },
        { label: 'PHASE SHIFT', key: 'phase', min: 0, max: 4 }
      ].map(slider => (
        <div key={slider.key} className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-bold text-stone-500 tracking-widest">
            <span>{slider.label}</span>
            <span className="text-emerald-500">{signalValues[slider.key]}</span>
          </div>
          <input 
            type="range" 
            min={slider.min} 
            max={slider.max} 
            step="1"
            value={signalValues[slider.key]}
            onChange={(e) => {
              const newVals = { ...signalValues, [slider.key]: parseInt(e.target.value) };
              setSignalValues(newVals);
              
              if (newVals.freq === activePuzzle.target.freq && 
                  newVals.amp === activePuzzle.target.amp && 
                  newVals.phase === activePuzzle.target.phase) {
                setTimeout(() => handlePuzzleSuccess(activePuzzle), 600);
              }
            }}
            className="w-full accent-emerald-500 h-2 bg-stone-800 rounded-none appearance-none cursor-pointer"
          />
        </div>
      ))}
    </div>
  </div>
                ) : activePuzzle.type === 'multiple-choice' ? (
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
              <span className="text-[10px] text-stone-500 font-bold">LEVEL {currentFloor + 1}</span>
              <span className="text-[10px] text-red-500 font-black mt-1">
                {formatTime(playTime)} | {deathCount} DEATHS
              </span>
            </div>
            
            <div className="bg-stone-950 border-2 border-stone-700 px-4 py-1 flex flex-col items-center justify-center min-w-[160px] mx-2">
              <span className="text-[10px] text-stone-500 font-bold flex justify-between w-full">
                <span>VITALS</span>
                <span className={`${hp <= 40 ? 'text-red-500 animate-pulse' : 'text-stone-500'}`}>{hp}%</span>
              </span>
              <div className="w-full h-3 bg-stone-800 mt-1 border border-stone-600 relative overflow-hidden">
                <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${hp}%` }} />
              </div>
            </div>

            <div className="hidden md:flex bg-stone-950 border-2 border-stone-700 px-6 py-2 flex-col items-center justify-center flex-1 mx-2">
              <span className="text-[10px] text-stone-500 font-bold">CURRENT SECTOR</span>
              <span className="text-xs font-bold text-yellow-500 mt-0.5">
                {currentFloor === 0 ? 'ENTRY CORRIDORS' : 'THE ABYSS'} 
              </span>
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