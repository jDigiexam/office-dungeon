export const RIDDLE_BANK = [
  // THE ORIGINAL 10
  { title: "SECURITY CHECK", question: "I have cities but no houses. I have mountains but no trees. I have water but no fish. What am I?", answer: "map" },
  { title: "LOGIC GATE", question: "What gets wetter the more it dries?", answer: "towel" },
  { title: "VOICE PRINT", question: "I speak without a mouth and hear without ears. I come alive with wind. What am I?", answer: "echo" },
  { title: "ENCRYPTION A", question: "The more of this there is, the less you see. What is it?", answer: "darkness" },
  { title: "ENCRYPTION B", question: "I shave every day, but my beard stays the same. What am I?", answer: "barber" },
  { title: "DATA RECOVERY", question: "What has keys but can't open locks?", answer: "piano" },
  { title: "SYSTEM ERROR", question: "I belong to you, but everyone else uses me more. What am I?", answer: "name" },
  { title: "AI CALIBRATION", question: "What has a head, a tail, is brown, and has no legs?", answer: "penny" },
  { title: "FIREWALL TEST", question: "If you drop me I'm sure to crack, but give me a smile and I'll always smile back.", answer: "mirror" },
  { title: "OVERRIDE", question: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "m" },
  
  // THE 10 NEW TECH-THEMED EXPANSIONS
  { title: "PERIPHERAL CHECK", question: "I have keys but no locks. I have space but no room. You can enter, but cannot go outside. What am I?", answer: "keyboard" },
  { title: "HARDWARE DIAGNOSTIC", question: "I have a memory but no brain. I can sleep but never dream. What am I?", answer: "computer" },
  { title: "NETWORK PING", question: "I am a web that catches no flies, but I can capture the whole world. What am I?", answer: "internet" },
  { title: "DATA RETRIEVAL", question: "I travel the world in seconds but have no passport. I deliver post but have no legs. What am I?", answer: "email" },
  { title: "SOFTWARE AUDIT", question: "I have no legs, but I can run. Not a single wheel, yet I might crash. What is it there upo your dash?", answer: "program" },
  { title: "STORAGE SCAN", question: "I live in the cloud but I produce no rain. I hold your files but have no hands. What am I?", answer: "data" },
  { title: "SYSTEM UI", question: "I have windows but no walls. I have a desktop but no physical desk. What am I?", answer: "monitor" },
  { title: "SECURITY PROTOCOL 2", question: "I am a phrase you must never speak. If I am weak, your secrets leak. What am I?", answer: "password" },
  { title: "INPUT DEVICE", question: "A wizard not, yet I hold a scroll. I can point, but hold no soul. What am I?", answer: "mouse" },
  { title: "MOTHERBOARD CHECK", question: "I am a path that connects all things, made of copper, silicon, and invisible strings. What am I?", answer: "network" }
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
    reward: { fIdx: 0, x: 20, z: 22, newTile: 17 }
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
  "0_27_61": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 30, z: 61, newTile: 17 }
  },
  "0_75_63": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 68, z: 60, newTile: 17 }
  },
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
  "0_99_75": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 98, z: 75, newTile: 17 }
  },
  "0_7_77": {
    type: "random-riddle",
    successMessage: "Correct. Security override processed.",
    reward: { fIdx: 0, x: 7, z: 74, newTile: 17 }
  },
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
  // ----------------------------------------------------
  // INTERACTIVE MINI-GAME TEMPLATES
  // (Update the "Floor_X_Z" keys to match where you want these on your map)
  // ----------------------------------------------------
  // 1. LIGHTS OUT (Dispenses Blue Keycard)
  "0_60_18": {
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
    reward: { fIdx: 0, x: 61, z: 16, newTile: 15 } // 15 = Blue Keycard
  },
  
  // 2. SLIDING PUZZLE (Dispenses Red Keycard)
  "0_51_85": {
    type: "sliding-puzzle",
    title: "DEFRAGMENTATION ALGORITHM",
    question: "REORDER THE MEMORY BLOCKS SEQUENTIALLY.",
    gridSize: 3, 
    initialGrid: [
      1, 2, 3,
      4, 0, 5,
      7, 8, 6
    ], 
    successMessage: "MEMORY DEFRAGMENTED. DISPENSING RED KEYCARD.",
    reward: { fIdx: 0, x: 50, z: 85, newTile: 5 } // 5 = Red Keycard
  },
  
  // 3. MEMORY MATCH (Dispenses Yellow Keycard)
  "0_6_30": {
    type: "memory-match",
    title: "PATTERN RECOGNITION",
    question: "OBSERVE AND REPEAT THE NODE SEQUENCE.",
    sequence: [0, 2, 1, 3, 2, 0], 
    successMessage: "SEQUENCE ACCEPTED. DISPENSING YELLOW KEYCARD.",
    reward: { fIdx: 0, x: 13, z: 23, newTile: 25 } // 25 = Yellow Keycard
  },
  
  // 4. MASTERMIND / CODEBREAKER (Dispenses Blue Keycard)
  "0_87_65": {
    type: "mastermind",
    title: "CODEBREAKER UTILITY",
    question: "CRACK THE 4-DIGIT PIN. YOU HAVE 6 ATTEMPTS.",
    successMessage: "ENCRYPTION BROKEN. ELEVATOR ROOM UNLOCKED.",
    reward: { fIdx: 0, x: 86, z: 66, newTile: 17 } // 17 = TERMINAL DOOR
  },
};