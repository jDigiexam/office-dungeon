export const RIDDLE_BANK = [
  // THE ORIGINAL 10
  { title: "SECURITY CHECK", question: "I have cities but no houses. I have mountains but no trees. I have water but no fish. What am I?", answer: "map" },
  { title: "LOGIC GATE", question: "What has roots as nobody sees, Is taller than trees, Up, up it goes, And yet never grows?", answer: "mountain" },
  { title: "VOICE PRINT", question: "He who makes it, has no need. He who buys it, no use indeed. He who uses it can neither feel nor see. So tell me know, what could it be?", answer: "coffin" },
  { title: "ENCRYPTION A", question: "It cannot be seen, cannot be felt, Cannot be heard, cannot be smelt. It lies behind stars and under hills, And empty holes it fills. It comes first and follows after, Ends life, kills laughter.", answer: "darkness" },
  { title: "ENCRYPTION B", question: "I can run but never walk, have a mouth but never talk, have a head but never weep, and have a bed but never sleep. What am I?", answer: "river" },
  { title: "DATA RECOVERY", question: "This thing all things devours... Birds, beasts, trees, flowers. Gnaws iron, bites steel... Grinds hard stones to meal. Slays king, ruins town, And beats high mountain down.", answer: "time" },
  { title: "SYSTEM ERROR", question: "I belong to you, but everyone else uses me more. What am I?", answer: "name" },
  { title: "AI CALIBRATION", question: "Poor men have it. Rich men need it. You'll surely die if you eat it.", answer: "nothing" },
  { title: "FIREWALL TEST", question: "If you drop me I'm sure to crack, but give me a smile and I'll always smile back.", answer: "mirror" },
  { title: "OVERRIDE", question: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "m" },
  
// THE 10 NEW TECH-THEMED RIDDLE EXPANSIONS
  { 
    title: "PERIPHERAL CHECK", 
    question: "I have keys but no locks, I have space but no door. You can always hit enter, then type a bit more. What am I?", 
    answer: "keyboard" 
  },
  { 
    title: "HARDWARE DIAGNOSTIC", 
    question: "I have plenty of memory but lack any brain. I often go to sleep, but I dream not in vain. What am I?", 
    answer: "computer" 
  },
  { 
    title: "NETWORK PING", 
    question: "I am a massive web that catches no flies, yet I link the whole world right before your eyes. What am I?", 
    answer: "internet" 
  },
  { 
    title: "DATA RETRIEVAL", 
    question: "I fly round the world in the blink of an eye. I deliver the post without crossing the sky. What am I?", 
    answer: "email" 
  },
  { 
    title: "SOFTWARE AUDIT", 
    question: "I have no legs, yet I always can run. I have not a wheel, but crashing is no fun. What am I?", 
    answer: "program" 
  },
  { 
    title: "STORAGE SCAN", 
    question: "I live in the cloud but I never make rain. I hold all your files in a digital brain. What am I?", 
    answer: "data" 
  },
  { 
    title: "SYSTEM UI", 
    question: "I have glowing windows, but I have no walls. I sit on a desk to display video calls. What am I?", 
    answer: "monitor" 
  },
  { 
    title: "SECURITY PROTOCOL 2", 
    question: "I am a secret phrase you must never speak. Because if I am guessed, your private files leak. What am I?", 
    answer: "password" 
  },
  { 
    title: "INPUT DEVICE", 
    question: "I am not a wizard, yet I hold a scroll. I click and I point, but I have no soul. What am I?", 
    answer: "mouse" 
  },
  { 
    title: "MOTHERBOARD CHECK", 
    question: "I am a path that connects all things, made of routers, switches, and invisible strings. What am I?", 
    answer: "network" 
  }
];

export const TERMINAL_DIRECTORY = {
  "0_71_14": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 71, z: 11, newTile: 17 }
  },
  "0_18_30": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 13, z: 23, newTile: 17 }
  },
  "0_76_47": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 80, z: 46, newTile: 17 }
  },
  "0_72_48": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 70, z: 50, newTile: 17 }
  },
  "0_28_44": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 27, z: 45, newTile: 17 }
  },
  "0_72_56": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 68, z: 60, newTile: 17 }
  },
  "0_97_59": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 97, z: 64, newTile: 17 }
  },
 // "0_27_61": {
  //  type: "random-riddle",
  //  successMessage: "Correct. Security override processed.",
  //  reward: { fIdx: 0, x: 30, z: 61, newTile: 17 }
 // },
  "0_87_65": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 86, z: 66, newTile: 17 }
  },
  "0_101_69": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 100, z: 70, newTile: 17 }
  },
  "0_50_71": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 46, z: 78, newTile: 17 }
  },
  "0_31_75": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 34, z: 75, newTile: 17 }
  },
  //"0_100_76": {
   // type: "random-riddle",
   // successMessage: "Correct. Security override processed.",
  //  reward: { fIdx: 0, x: 98, z: 75, newTile: 17 }
 // },
  //"0_7_77": {
  // type: "random-riddle",
 //  successMessage: "Correct. Security override processed.",
 // },
  "0_74_25": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 46, z: 78, newTile: 17 }
  },
  "0_52_46": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 51, z: 47, newTile: 17 }
  },
  "0_60_18": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 61, z: 17, newTile: 17 }
  },
  // ----------------------------------------------------
  // INTERACTIVE MINI-GAME TEMPLATES
  // (Update the "Floor_X_Z" keys to match where you want these on your map)
  // ----------------------------------------------------
  // 1. LIGHTS OUT (Dispenses Blue Keycard)
  "0_6_30": {
    type: "lights-out",
    title: "MAINFRAME BYPASS",
    question: "ALIGN ALL SECURITY NODES TO PROCEED.",
    gridSize: 3, 
    initialGrid: [
      1, 0, 1,
      0, 1, 0,
      1, 0, 1
    ],
    successMessage: "BYPASS SUCCESSFUL. DISPENSING BLUE KEYCARD.",
    reward: { fIdx: 0, x: 9, z: 30, newTile: 15 } // 15 = Blue Keycard
  },
  
  // 2. SLIDING PUZZLE (Dispenses Red Keycard)
  "0_51_85": {
    type: "sliding-puzzle",
    title: "DEFRAGMENTATION ALGORITHM",
    question: "REORDER THE MEMORY BLOCKS SEQUENTIALLY.",
    gridSize: 3, 
    initialGrid: [
      3, 4, 8,
      6, 0, 5,
      2, 7, 1
    ], 
    successMessage: "MEMORY DEFRAGMENTED. DISPENSING RED KEYCARD.",
    reward: { fIdx: 0, x: 50, z: 85, newTile: 5 } // 5 = Red Keycard
  },
  
  // 3. MEMORY MATCH (Dispenses Yellow Keycard)
  "0_75_63": {
    type: "memory-match",
    title: "PATTERN RECOGNITION",
    question: "OBSERVE AND REPEAT THE NODE SEQUENCE.",
    sequence: [0, 2, 1, 3, 2, 0, 1, 0, 3, 2], 
    successMessage: "SEQUENCE ACCEPTED. DISPENSING YELLOW KEYCARD.",
    reward: { fIdx: 0, x: 71, z: 63, newTile: 25 } // 25 = Yellow Keycard
  },
  
  // 4. MASTERMIND / CODEBREAKER (Opens Hellivator Door)
  "0_87_65": {
    type: "mastermind",
    title: "CODEBREAKER UTILITY",
    question: "CRACK THE 4-DIGIT PIN. YOU HAVE 8 ATTEMPTS.",
    successMessage: "ENCRYPTION BROKEN. ELEVATOR ROOM UNLOCKED.",
    reward: { fIdx: 0, x: 86, z: 66, newTile: 17 } // 17 = TERMINAL DOOR
  },

  // FINAL BOSS ROOM MASTERMIND
  "1_14_20": { 
    type: "signal-sync",
    title: "BIOMETRIC SIGNAL SYNC",
    question: "CALIBRATE LOCAL WAVEFORM TO MATCH THE SECURE ENTITY SIGNATURE.",
    target: { freq: 4, amp: 3, phase: 2 }, // Target slider values (1-5)
    successMessage: "SIGNAL LOCKED. CONTAINMENT DOORS OPENED.",
    reward: { fIdx: 1, x: 14, z: 18, newTile: 17 } // 17 = TERMINAL DOOR
  },
// 5. WORD HACKER (Fallout Style)
"0_27_61": {
  type: "word-hacker",
    title: "SECTOR 4 INDUSTRIES UNIFIED OPERATING SYSTEM",
    question: "ENTER PASSWORD NOW",
    words: [
      "SYNDROME", "SABOTAGE", "SURVIVAL", "SECURITY", 
      "SANCTITY", "STRATEGY", "STRENGTH", "SOLDIERS", 
      "SYLLABLE", "SYMPHONY", "SYNERGIC", "SKELETON"
    ],
    target: "SYNDROME",
    successMessage: "EXACT MATCH! PLEASE WAIT... ACCESS GRANTED.",
  reward: { fIdx: 0, x: 30, z: 61, newTile: 17 } // 17 = TERMINAL DOOR
},

// 6. POWER ROUTING (Pipe Connection)
"0_101_69": {
  type: "wire-routing",
    title: "POWER RELAY",
    question: "ALIGN CONDUITS TO RESTORE MAINFRAME POWER.",
    gridSize: 3,
    // 0 = Straight (┃), 1 = Corner (┗)
    // This creates an interconnected spiral path
    shapes: [
      0, 0, 1,
      1, 0, 0,
      1, 0, 1
    ],
    // 0 = 0deg, 1 = 90deg, 2 = 180deg, 3 = 270deg
    initialRotations: [0, 0, 0, 3, 0, 1, 2, 0, 1],
    targetRotations:  [1, 1, 2, 1, 1, 0, 0, 1, 3], 
    successMessage: "POWER RESTORED. DOOR UNLOCKED.",
  reward: { fIdx: 0, x: 100, z: 70, newTile: 17 } // 17 = TERMINAL DOOR
},

// 7. BIOMETRIC TIMING LOCK
"0_7_77": { 
  type: "timing-lock",
  title: "BIOMETRIC SCANNER OVERRIDE",
  question: "ALIGN THE FREQUENCIES. HALT THE SIGNAL EXACTLY WITHIN THE TARGET ZONES.",
  stages: [
    { target: 30, width: 30, speed: 1 }, // Easy
    { target: 70, width: 20, speed: 2 }, // Medium
    { target: 45, width: 15, speed: 3 }  // Hard
  ],
  successMessage: "BIOMETRICS SPOOFED. DOOR UNLOCKED.",
  reward: { fIdx: 0, x: 51, z: 50, newTile: 17 }
},

// 8. COOLANT BALANCER
"0_55_55": {
  type: "coolant-balance",
  title: "REACTOR COOLANT SYSTEMS",
  question: "BALANCE THE ISOTOPES TO REACH EXACTLY 100% PRESSURE.",
  // Formula: (Alpha * 5) + (Beta * 15) - (Gamma * 10) = 100
  // A solution: Alpha=5 (25), Beta=7 (105), Gamma=3 (-30) -> 25 + 105 - 30 = 100
  multipliers: { alpha: 5, beta: 15, gamma: -10 },
  target: 100,
  successMessage: "PRESSURE STABILIZED. CONTAINMENT FIELD OPEN.",
  reward: { fIdx: 0, x: 56, z: 55, newTile: 17 }
}
};